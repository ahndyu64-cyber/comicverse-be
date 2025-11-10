const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Comicverse';

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB at', MONGO_URI);

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

  const Comic = mongoose.model('Comic', ComicSchema);

  const newComics = [
    {
      title: 'Shadow Hunter',
      slug: 'shadow-hunter',
      description: 'A hunter who stalks monsters in the night.',
      authors: ['NightWriter'],
      genres: ['Action', 'Fantasy'],
      chapters: [{ title: 'Chapter 1: Nightfall', images: ['sh1.jpg'] }],
    },
    {
      title: 'Galactic Odyssey',
      slug: 'galactic-odyssey',
      description: 'Space opera with mechs and mystery.',
      authors: ['Star Gazer'],
      genres: ['Adventure', 'Fantasy'],
      chapters: [{ title: 'Chapter 1: Launch', images: ['g1.jpg'] }],
    },
    {
      title: 'Kitchen Chronicles',
      slug: 'kitchen-chronicles',
      description: 'A cooking comedy with heart.',
      authors: ['ChefSensei'],
      genres: ['Comedy', 'Drama'],
      chapters: [{ title: 'Chapter 1: First Dish', images: ['k1.jpg'] }],
    },
    {
      title: 'Mystic Garden',
      slug: 'mystic-garden',
      description: 'A quiet fantasy about a magical garden.',
      authors: ['GreenThumb'],
      genres: ['Fantasy', 'Romance'],
      chapters: [{ title: 'Chapter 1: Seeds', images: ['m1.jpg'] }],
    },
    {
      title: 'Campus Days',
      slug: 'campus-days',
      description: 'Slice-of-life at a lively university.',
      authors: ['CampusClub'],
      genres: ['Comedy', 'Romance'],
      chapters: [{ title: 'Chapter 1: Orientation', images: ['c1.jpg'] }],
    },
  ];

  for (const c of newComics) {
    try {
      const existing = await Comic.findOne({ slug: c.slug }).exec();
      if (existing) {
        console.log('Skipping existing comic:', c.slug);
        continue;
      }
      const created = await Comic.create(c);
      console.log('Inserted comic:', created.title, 'id=', created._id.toString());
    } catch (err) {
      console.error('Error inserting', c.title, err.message);
    }
  }

  const total = await Comic.countDocuments();
  console.log('Total comics in DB:', total);

  await mongoose.disconnect();
  console.log('Disconnected');
}

run().catch(err => { console.error(err); process.exit(1); });
