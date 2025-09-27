// Simple script to replace spaces with underscores in background image paths

const fs = require('fs');
const path = require('path');

// Files to update with their paths
const filesToUpdate = [
  'src/pages/Gallery.tsx',
  'src/pages/About.tsx',
  'src/pages/SavedEvents.tsx',
  'src/pages/LocationHistory.tsx',
  'src/pages/Donate.tsx',
  'src/pages/Team.tsx',
  'src/components/EventCardSimple.tsx',
  'src/components/LocationDetailsModern.tsx',
  'src/components/EventCardModern.tsx',
  'src/components/EventDetails.tsx'
];

// The string to find and replace
const searchString = 'Historical Parchment Background Portrait.jpg';
const replaceString = 'Historical_Parchment_Background_Portrait.jpg';

// Process each file
filesToUpdate.forEach(relativePath => {
  const filePath = path.join(process.cwd(), relativePath);
  
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains the search string
    if (content.includes(searchString)) {
      // Replace all occurrences
      const updatedContent = content.split(searchString).join(replaceString);
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${relativePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${relativePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${relativePath}:`, error.message);
  }
});

console.log('\n🎉 Background image paths updated successfully!');

// Also update the image file name in the public directory
const oldImagePath = path.join(process.cwd(), 'public', 'images', 'background', 'small', searchString);
const newImagePath = path.join(process.cwd(), 'public', 'images', 'background', 'small', replaceString);

try {
  if (fs.existsSync(oldImagePath)) {
    fs.renameSync(oldImagePath, newImagePath);
    console.log(`✅ Renamed image file to: ${replaceString}`);
  } else {
    console.log('ℹ️  No image file found to rename, continuing...');
  }
} catch (error) {
  console.error('❌ Error renaming image file:', error.message);
}

console.log('\n✨ All done! Make sure to commit your changes.');