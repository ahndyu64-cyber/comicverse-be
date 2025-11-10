const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/comicverse';

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB at', MONGO_URI);

  // Define minimal schemas to insert data
  const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    slug: String,
  }, { timestamps: true });

  const ChapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: String,
    date: { type: Date, default: Date.now },
    images: { type: [String], default: [] },
    isDraft: { type: Boolean, default: false },
  }, { _id: true });

  const ComicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: String,
    cover: String,
    description: String,
    authors: { type: [String], default: [] },
    genres: { type: [String], default: [] },
    status: { type: String, default: 'ongoing' },
    chapters: { type: [ChapterSchema], default: [] },
  }, { timestamps: true });

  const Category = mongoose.model('Category', CategorySchema);
  const Comic = mongoose.model('Comic', ComicSchema);

  // Sample data
  const categories = [
    { name: 'Action', description: 'Action manga and comics' },
    { name: 'Adventure', description: 'Adventure manga and comics' },
    { name: 'Comedy', description: 'Comedy manga and comics' },
    { name: 'Drama', description: 'Drama manga and comics' },
    { name: 'Fantasy', description: 'Fantasy manga and comics' },
    { name: 'Romance', description: 'Romance manga and comics' },
  ];

  for (const c of categories) {
    try {
      await Category.updateOne({ name: c.name }, { $set: c }, { upsert: true });
      console.log('Upserted category', c.name);
    } catch (err) {
      console.error('Category error', c.name, err.message);
    }
  }

  // Add sample comics
  const sampleComics = [
    {
      title: 'The Brave Swordsman',
      slug: 'the-brave-swordsman',
      cover: '',
      description: 'An action-packed tale of a wandering swordsman.',
      authors: ['Ahn Dyu'],
      genres: ['Action', 'Adventure'],
      status: 'ongoing',
      chapters: [
        { title: 'Chapter 1: A New Road', images: ['img1.jpg', 'img2.jpg'] },
      ],
    },
    {
      title: 'Slice of Life Romance',
      slug: 'slice-of-life-romance',
      cover: '',
      description: 'A gentle romantic comedy in daily life.',
      authors: ['Jane Doe'],
      genres: ['Romance', 'Comedy'],
      status: 'ongoing',
      chapters: [
        { title: 'Chapter 1: Meeting', images: ['page1.jpg'] },
      ],
    },
  ];

  for (const sc of sampleComics) {
    try {
      const existing = await Comic.findOne({ slug: sc.slug }).exec();
      if (existing) {
        console.log('Comic already exists, skipping:', sc.slug);
        continue;
      }
      const created = await Comic.create(sc);
      console.log('Created comic', created.title, 'id=', created._id.toString());
    } catch (err) {
      console.error('Comic error', sc.title, err.message);
    }
  }

  // Print counts
  const catCount = await Category.countDocuments();
  const comicCount = await Comic.countDocuments();
  console.log(`Categories: ${catCount}, Comics: ${comicCount}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

run().catch(err => { console.error(err); process.exit(1); });
