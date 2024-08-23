"use client";
import Link from "next/link";
import React from "react";

const Page = () => {
  const semester = "1"; // fetch it from parameter: semester

  const subjects = ["subject1", "subject2", "subject3"];

  return (
    <div>
      <h1>Subjects</h1>
      <p>Semester: {semester}</p>
      <ul className="grid columns-1">
        {subjects.map((subject, index) => (
          <Link key={index} href="/material?subject=lol">
            {subject}
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default Page;
