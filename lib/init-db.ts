import fs from 'fs';
import path from 'path';
import db from './db';

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // スキーマファイルを読み込む
    const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // スキーマを実行
    await db.query(schema);
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// スクリプトが直接実行された場合のみ初期化を実行
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase;