// Node.js fundamentals demo

const greet = (name) => {
  return `Hello, ${name}!`;
};

function addNumbers(a, b) {
  return a + b;
}

function readData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Data loaded from async operation");
    }, 1000);
  });
}

console.log("1. Synchronous code runs immediately");
console.log(greet("LeadFlow CRM"));
console.log("2 + 3 =", addNumbers(2, 3));

async function main() {
  console.log("2. Starting async work...");
  const result = await readData();
  console.log(result);
  console.log("3. Async work finished");
}

main();
