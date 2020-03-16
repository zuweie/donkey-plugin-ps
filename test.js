const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

sharp({
   create: {
     width: 30,
     height: 20,
     channels: 4,
     background: { r: 255, g: 0, b: 0, alpha: 0.5 }
   }
 })
 .png()
 .toBuffer()
 .then( data => { 
      console.log('then',data)
      return data;
      })

// sharp('D:\\proj\\a3\\donkey\\media_source\\bucket-pic-development\\d4e88f0856d12bbb48bb8916deada976.png')
//   .rotate()
//   .resize(200)
//   .toBuffer()
//   .then( data => { 
//    console.log('then',data)
//    return data;
//    })
//   .catch( err => { 
//      console.log('catch',err)
//    });     