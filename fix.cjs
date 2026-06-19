const fs = require('fs');
let file = fs.readFileSync('src/views/DashboardView.vue', 'utf8');
file = file.replace(/size="(\d+)"/g, ':size="$1"');
fs.writeFileSync('src/views/DashboardView.vue', file);
console.log('Fixed sizes');
