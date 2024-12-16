// eslint-disable-next-line @typescript-eslint/no-require-imports
const os = require('os');
const networkInterfaces = os.networkInterfaces();

console.log('Network Interface Information:');
console.log('==============================');

for (const [name, interfaces] of Object.entries(networkInterfaces)) {
    console.log(`\nInterface: ${name}`);
    interfaces.forEach((interface, index) => {
        console.log(`  Address ${index + 1}:`);
        console.log(`    IP Address: ${interface.address}`);
        console.log(`    Netmask: ${interface.netmask}`);
        console.log(`    Family: ${interface.family}`);
        console.log(`    MAC Address: ${interface.mac}`);
        console.log(`    Internal: ${interface.internal}`);
        console.log(`    CIDR: ${interface.cidr}`);
    });
}
