import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse multipart form data from email service (SendGrid Inbound Parse format)
    const formData = await req.formData();
    const sender = formData.get("from") as string || "unknown";
    const subject = formData.get("subject") as string || "No subject";
    
    // Extract attachment count and files
    const attachmentCount = parseInt(formData.get("attachments") as string || "0");
    const uploadedDocs: string[] = [];

    for (let i = 0; i < attachmentCount; i++) {
      const attachment = formData.get(`attachment${i + 1}`) as File;
      if (!attachment) continue;

      const timestamp = Date.now();
      const storagePath = `documents/${timestamp}_${attachment.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, attachment, {
          contentType: attachment.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(`Upload error for ${attachment.name}:`, uploadError);
        continue;
      }

      // Insert document record
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert({
          filename: attachment.name,
          title: attachment.name.replace(/\.[^/.]+$/, ""),
          uploader: sender,
          source: "scan_to_email",
          status: "processing",
          tags: [],
          file_size: attachment.size,
          file_type: attachment.type,
          storage_path: storagePath,
        })
        .select("id")
        .single();

      if (docError) {
        console.error(`Document insert error:`, docError);
        continue;
      }

      uploadedDocs.push(docData.id);

      // Trigger parse-document function asynchronously
      const parseUrl = `${supabaseUrl}/functions/v1/parse-document`;
      fetch(parseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          document_id: docData.id,
          storage_path: storagePath,
        }),
      }).catch((err) => console.error("Parse trigger error:", err));
    }

    // Insert notification if documents were uploaded
    if (uploadedDocs.length > 0) {
      const n = uploadedDocs.length;
      await supabase.from("notifications").insert({
        type: "document_sync",
        title: `${n} new document${n > 1 ? "s" : ""} synced from email`,
        description: `Your scan-to-email address received ${n} document${n > 1 ? "s" : ""} from ${sender}.`,
        action_url: "/documents",
      });
    }

    return new Response(
      JSON.stringify({ success: true, count: uploadedDocs.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ingest-email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
