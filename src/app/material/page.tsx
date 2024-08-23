import React from "react";

const Page = () => {
  // Dummy test data
  const dummyTests = ["Test 1", "Test 2", "Test 3", "Test 4", "Test 5"];

// use the implementation of fuse.js to search
// you can get it from fcislol_v1.0

  return (
    <div>
      <input type="text" placeholder="Search" />
      <ul>
        {dummyTests.map((test, index) => (
          <li key={index}>{test}</li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
