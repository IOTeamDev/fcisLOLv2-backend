"use client"
import Link from 'next/link';
import React, { useState } from 'react';

const Page: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
  const semesters = ['Semester 1', 'Semester 2'];

  return (
    <div className='bg-black w-full h-screen'>
      <h1>Main</h1>
      <div>
        <label htmlFor="levelDropdown">Select Level:</label>
        <select
          id="levelDropdown"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
        >
          <option value="">-- Select Level --</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="semesterDropdown">Select Semester:</label>
        <select
          id="semesterDropdown"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          <option value="">-- Select Semester --</option>
          {semesters.map((semester) => (
            <option key={semester} value={semester}>
              {semester}
            </option>
          ))}
        </select>
        <Link href='/subjects?semester=lol'>GO</Link>
      </div>
    </div>
  );
};

export default Page;