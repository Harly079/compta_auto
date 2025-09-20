import fetch from "node-fetch";

type Method = "GET" | "POST" | "PATCH";

const AIRTABLE_API = "https://api.airtable.com/v0";

function getConfig() {
  const mode = process.env.RUN_MODE || "local";
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  return { mode, apiKey, baseId };
}

export function isCloudMode() {
  const { mode, apiKey, baseId } = getConfig();
  return mode === "cloud" && !!apiKey && !!baseId;
}

async function airtableRequest(table: string, method: Method, body?: any) {
  if (!isCloudMode()) {
    throw new Error("Airtable non configuré en mode local");
  }
  const { apiKey, baseId } = getConfig();
  const url = `${AIRTABLE_API}/${baseId}/${table}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Airtable error ${response.status}: ${text}`);
  }
  return response.json();
}

export async function createRecord(table: string, fields: Record<string, any>) {
  return airtableRequest(table, "POST", { fields });
}

export async function updateRecord(table: string, recordId: string, fields: Record<string, any>) {
  return airtableRequest(`${table}/${recordId}`, "PATCH", { fields });
}

export async function listRecords(table: string, params: Record<string, string> = {}) {
  const { apiKey, baseId } = getConfig();
  if (!isCloudMode()) {
    throw new Error("Airtable non configuré en mode local");
  }
  const query = new URLSearchParams(params).toString();
  const url = `${AIRTABLE_API}/${baseId}/${table}${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Airtable error ${response.status}: ${text}`);
  }
  return response.json();
}
