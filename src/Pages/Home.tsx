import React from 'react';
import './Home.css'; // import the CSS file for additional styles

const Home = () => {
  const projects = [
    {
      title: 'Trucker Link',
      description: 'A specialized navigation app for truck routes with real-time communication features.',
      techStack: 'Flutter, Node.js, Sql, AWS S3, Dart, Firebase',
    },
    {
      title: 'Coding Hats',
      description: 'A collaborative platform for developers to share coding challenges and solutions.',
      techStack: 'MERN Stack (MongoDB, Express, React, Node.js)',
    },
  ];

  const technicalExperience = [
    'An experience Software Development Engineer and An certified AWS Solution Architect',
    '2+ year of experience with React, TypeScript, Node.js, SpringBoot,Flutter and AWS',
    'Experience in Backend Development with Node.js, SpringBoot, MongoDB , SQL and AWS backend services',
    'Proficient in React, AWS services, TypeScript, Redux, and Tailwind CSS',
    'Worked with AWS and other cloud technologies',
  ];

  return (
    <div className="min-h-screen py-16 px-8">
      {/* Navbar */}

      {/* Welcome Screen */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-6xl font-bold text-blue-900 mb-6">Welcome to My Home Screen</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Hello! I'm <span className="font-semibold text-blue-700">Shaurya Pratap Singh</span>, a software engineer passionate about building scalable, innovative solutions
          in full-stack development, backend systems, and an Certified AWS Solution Architect.
        </p>
      </div>

       {/* Technical Experience Section */}
       <div className="max-w-6xl mx-auto mb-20">
        <h2 className="text-4xl font-bold text-blue-800 mb-10 border-b-4 border-blue-300 inline-block">Technical Experience</h2>
        <ul className="list-disc list-inside space-y-4 text-lg text-gray-800">
          {technicalExperience.map((item, index) => (
            <li key={index} className="hover:text-blue-600 transition-colors duration-200">{item}</li>
          ))}
        </ul>
      </div>

      {/* Projects Section */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-blue-800 mb-10 border-b-4 border-blue-300 inline-block">Projects</h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-10">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-t-4 border-blue-500"
            >
              <h3 className="text-3xl font-semibold text-blue-900 mb-3">{project.title}</h3>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <p className="text-sm text-blue-700 font-medium">
                <strong>Tech Stack:</strong> {project.techStack}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;
