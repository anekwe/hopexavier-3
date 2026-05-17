import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";

// This will run the Express App on Port 3000
const PORT = 3000;
const app = express();
app.use(express.json());

// Basic webhook verification for WhatsApp Cloud API
app.get("/api/whatsapp/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // In production, you would fetch this from your database (whatsapp_settings table)
  // For now we assume verify token is validated correctly or handled elsewhere
  // To strictly prevent unauthorized connections before DB is read, we should read DB here ideally,
  // but to keep it simple and stateless for webhook handshake:
  if (mode === "subscribe" && token) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming message handler for WhatsApp Webhook
app.post("/api/whatsapp/webhook", async (req, res) => {
  try {
    const body = req.body;

    // Check the Incoming webhook message
    if (body.object === "whatsapp_business_account") {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        let phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
        let from = body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
        let msg_body = body.entry[0].changes[0].value.messages[0].text?.body; // extract the message text from the webhook payload

        console.log(`Incoming message: ${msg_body} from ${from}`);

        // TODO: Query Supabase to get auto-reply settings or AI bots.
        // For demonstration, here is the API approach if we had the access_token:
        /*
        axios({
          method: "POST", // Required, HTTP method, a string, e.g. POST, GET
          url: "https://graph.facebook.com/v17.0/" + phone_number_id + "/messages?access_token=" + 'YOUR_DB_TOKEN',
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: { body: "Ack: " + msg_body },
          },
          headers: { "Content-Type": "application/json" },
        });
        */
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.sendStatus(500);
  }
});

// Outgoing message helper (Triggered by Admin Panel)
app.post("/api/whatsapp/send", async (req, res) => {
  const { to, message, phoneNumberId, accessToken } = req.body;
  if (!to || !message || !phoneNumberId || !accessToken) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
          preview_url: false,
          body: message
        }
      }
    });
    
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Failed to send WhatsApp message:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
});


async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
