const { MongoClient } = require('mongodb');

const localUri = 'mongodb://localhost:27017';
const atlasUri = 'mongodb+srv://Comicverse:comicverse123@comicverse.rmsydey.mongodb.net/?appName=Comicverse';
const dbName = 'Comicverse';

async function migrateDatabase() {
  const localClient = new MongoClient(localUri);
  const atlasClient = new MongoClient(atlasUri);

  try {
    console.log('Kết nối Local MongoDB...');
    await localClient.connect();
    console.log('✓ Kết nối Local MongoDB thành công\n');
    
    console.log('Kết nối MongoDB Atlas...');
    await atlasClient.connect();
    console.log('✓ Kết nối MongoDB Atlas thành công\n');

    const localDb = localClient.db(dbName);
    const atlasDb = atlasClient.db(dbName);

    // List tất cả databases
    const admin = localClient.db('admin');
    const databases = await admin.admin().listDatabases();
    console.log('Databases có sẵn:');
    databases.databases.forEach(db => console.log(`  - ${db.name}`));
    console.log('');

    const collections = await localDb.listCollections().toArray();
    console.log(`Tìm thấy ${collections.length} collections\n`);
    
    if (collections.length === 0) {
      console.log('⚠ Không tìm thấy collections. Kiểm tra database name hoặc MongoDB local...');
      return;
    }

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`Migrating collection: ${collectionName}`);

      const sourceCollection = localDb.collection(collectionName);
      const targetCollection = atlasDb.collection(collectionName);

      const documents = await sourceCollection.find({}).toArray();
      console.log(`  - Tìm thấy ${documents.length} documents`);

      if (documents.length > 0) {
        await targetCollection.deleteMany({});
        const result = await targetCollection.insertMany(documents);
        console.log(`  - Insert thành công ${result.insertedCount} documents`);
      }
      console.log('');
    }

    console.log('✅ Migration hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

migrateDatabase();
