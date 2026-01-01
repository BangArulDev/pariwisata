import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/", (req, res) => {
  res.send("Grobogan Tourism API is running");
});

// Endpoint to get all tourism spots
app.get("/api/wisata", async (req, res) => {
  try {
    const { data, error } = await supabase.from("wisata").select("*");

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// --- CRUD Endpoints for Wisata ---

// Create a new tourism spot
app.post("/api/wisata", async (req, res) => {
  const { name, type, description, image_url, rating, has_ar } = req.body;
  try {
    const { data, error } = await supabase
      .from("wisata")
      .insert([{ name, type, description, image_url, rating, has_ar }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a tourism spot
app.put("/api/wisata/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const { data, error } = await supabase
      .from("wisata")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a tourism spot
app.delete("/api/wisata/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("wisata").delete().eq("id", id);

    if (error) throw error;
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
