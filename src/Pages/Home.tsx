import React from 'react';

const Home = () => {
  const projects = [
    {
      title: 'Trucker Link',
      description: 'A specialized navigation app for truck routes with real-time communication features.',
      techStack: 'React, Node.js, Firebase',
    },
    {
      title: 'Coding Hats',
      description: 'A collaborative platform for developers to share coding challenges and solutions.',
      techStack: 'MERN Stack (MongoDB, Express, React, Node.js)',
    },
  ];

  const technicalExperience = [
    '2+ years experience in JavaScript and TypeScript',
    '1+ year of experience with Flutter',
    'Experience in Backend Development with Node.js, FastAPI, and Golang',
    'Proficient in React, Next.js, Redux, and Tailwind CSS',
    'Worked with AWS, MongoDB, SQL, and other cloud technologies',
  ];

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Screen */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to My Portfolio</h1>
        <p className="text-lg text-gray-600">
          Hello! I'm Shaurya Pratap Singh, a passionate software engineer with experience in full-stack
          development, backend systems, and cloud technologies.
        </p>
      </div>

      {/* Projects Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Previous Projects</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-3">{project.title}</h3>
              <p className="text-gray-700 mb-3">{project.description}</p>
              <p className="text-sm text-gray-500"><strong>Tech Stack:</strong> {project.techStack}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Experience Section */}
      <div>
        <h2 className="text-3xl font-semibold mb-6">Technical Experience</h2>
        <ul className="list-disc list-inside space-y-3 text-lg text-gray-700">
          {technicalExperience.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
