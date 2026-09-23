require("dotenv").config();
const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
  { key: { type: String, required: true, unique: true }, value: mongoose.Schema.Types.Mixed },
  { timestamps: true }
);
const Setting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);

const aboutData = {
  aboutBadge: "About the Resort",
  aboutTitle: "Where Nature Becomes Your Home",
  aboutBody: `<p>Nestled amidst the lush forests and scenic landscapes of Maredumilli, our resort offers a refreshing escape from the noise and pace of everyday life. Surrounded by greenery, hills, and the soothing sounds of nature, every stay is designed to bring you closer to the beauty of the wilderness.</p>
<p>Whether you\u2019re looking for a peaceful weekend getaway, a family holiday, or an opportunity to explore the natural wonders around Maredumilli, our resort provides the perfect setting to relax, reconnect, and create unforgettable memories.</p>
<ul>
  <li>Comfortable and thoughtfully designed accommodations</li>
  <li>Surrounded by lush greenery and natural landscapes</li>
  <li>Easy access to nearby waterfalls and nature attractions</li>
  <li>Authentic local experiences and warm hospitality</li>
  <li>Peaceful spaces for relaxation and family time</li>
</ul>`,
  aboutImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=85",
  aboutYearsNumber: "100%",
  aboutYearsLabel: "Pure. Peaceful. Unforgettable.",
  aboutLink: "/resort",
  aboutLinkText: "Escape to Nature",
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("[DB] Connected:", mongoose.connection.host, "/", mongoose.connection.name);

  // Load existing site_config
  let doc = await Setting.findOne({ key: "site_config" });

  if (!doc) {
    // Create fresh with full Maredumilli defaults
    doc = await Setting.create({
      key: "site_config",
      value: {
        siteName: "Maredumilli Resort",
        tagline: "Maredumilli, Andhra Pradesh",
        description: "Nestled amidst the lush forests and scenic landscapes of Maredumilli, our resort offers a refreshing escape from the noise and pace of everyday life.",
        phone: "+91 98765 43210",
        email: "reservations@maredumilliresort.com",
        address: "Maredumilli, East Godavari District, Andhra Pradesh 533288, India",
        heroImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=90",
        heroTitle: "Escape Into the Heart of Maredumilli",
        heroSubtitle: "Where lush forests, sparkling waterfalls, and the sounds of nature welcome you to a truly peaceful retreat.",
        taxRate: 18,
        currency: "INR",
        ...aboutData,
      },
    });
    console.log("[SEED] Created new site_config document with About section.");
  } else {
    // Merge only the aboutSection fields into existing doc — preserves all other settings
    const updatedValue = { ...doc.value, ...aboutData };
    await Setting.updateOne({ key: "site_config" }, { $set: { value: updatedValue } });
    console.log("[SEED] Updated existing site_config with Maredumilli About section.");
  }

  // Verify
  const result = await Setting.findOne({ key: "site_config" });
  console.log("\n--- Seeded About Section ---");
  console.log("Badge   :", result.value.aboutBadge);
  console.log("Title   :", result.value.aboutTitle);
  console.log("Image   :", result.value.aboutImage);
  console.log("Years # :", result.value.aboutYearsNumber);
  console.log("Years L :", result.value.aboutYearsLabel);
  console.log("CTA     :", result.value.aboutLinkText, "->", result.value.aboutLink);
  console.log("Body    : [HTML, length", result.value.aboutBody?.length, "chars]");
  console.log("\n[DONE] Seeding complete.");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[ERROR]", err.message);
  process.exit(1);
});
