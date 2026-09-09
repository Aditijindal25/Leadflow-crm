const express = require("express");

const app = express();
const PORT = 5000;

app.use(express.json());

let leads = [
  {
    id: 1,
    name: "Jane Doe",
    company: "Acme Studio",
    status: "NEW",
    email: "jane@acme.com"
  },
  {
    id: 2,
    name: "John Smith",
    company: "Nova Labs",
    status: "CONTACTED",
    email: "john@novalabs.com"
  }
];

app.get("/api/leads", (req, res) => {
  res.status(200).json({
    success: true,
    count: leads.length,
    data: leads
  });
});

app.get("/api/leads/count", (req, res) => {
  res.status(200).json({
    success: true,
    count: leads.length
  });
});

app.get("/api/leads/:id", (req, res) => {
  const lead = leads.find((item) => item.id === Number(req.params.id));

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found"
    });
  }

  res.status(200).json({
    success: true,
    data: lead
  });
});

app.post("/api/leads", (req, res) => {
  const { name, company, email, status } = req.body;

  if (!name || !company || !email) {
    return res.status(400).json({
      success: false,
      message: "Name, company, and email are required"
    });
  }

  const newLead = {
    id: leads.length ? leads[leads.length - 1].id + 1 : 1,
    name,
    company,
    email,
    status: status || "NEW"
  };

  leads.push(newLead);

  res.status(201).json({
    success: true,
    message: "Lead created successfully",
    data: newLead
  });
});

app.patch("/api/leads/:id", (req, res) => {
  const id = Number(req.params.id);
  const leadIndex = leads.findIndex((item) => item.id === id);

  if (leadIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Lead not found"
    });
  }

  leads[leadIndex] = {
    ...leads[leadIndex],
    ...req.body
  };

  res.status(200).json({
    success: true,
    message: "Lead updated successfully",
    data: leads[leadIndex]
  });
});

app.delete("/api/leads/:id", (req, res) => {
  const id = Number(req.params.id);
  const originalLength = leads.length;
  leads = leads.filter((item) => item.id !== id);

  if (leads.length === originalLength) {
    return res.status(404).json({
      success: false,
      message: "Lead not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Lead deleted successfully"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});