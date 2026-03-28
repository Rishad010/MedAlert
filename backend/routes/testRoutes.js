// routes/testRoutes.js
router.post("/trigger-stock-expiry", async (req, res) => {
  await agenda.now("check-stock-expiry");
  res.json({ message: "Stock/expiry check triggered" });
});
