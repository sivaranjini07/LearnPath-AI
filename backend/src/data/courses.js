export const courses = [
  {
    id: "js-basics",
    title: "JavaScript Fundamentals",
    type: "course",
    skills: ["JavaScript", "Programming"],
    prerequisites: ["HTML", "CSS"],
    level: "beginner",
    duration: "2 weeks",
    description: "Variables, functions, arrays, objects, ES6 and DOM fundamentals.",
    curriculum: [
      {
        week: "Week 1",
        topics: [
          "Variables (var, let, const) and data types",
          "Operators and control flow (if/else, switch, loops)",
          "Writing and calling functions",
          "Scope and hoisting basics"
        ]
      },
      {
        week: "Week 2",
        topics: [
          "Arrays and common array methods (map, filter, forEach)",
          "Objects and object methods",
          "ES6 essentials: arrow functions, template literals, destructuring",
          "DOM selection and manipulation, event listeners"
        ]
      }
    ]
  },
  {
    id: "js-async",
    title: "Modern JavaScript & Async Programming",
    type: "course",
    skills: ["JavaScript", "Async Programming", "APIs"],
    prerequisites: ["JavaScript"],
    level: "intermediate",
    duration: "2 weeks",
    description: "Promises, async/await, fetch, modules and API handling.",
    curriculum: [
      {
        week: "Week 1",
        topics: [
          "The event loop and callback functions",
          "Promises: creating, chaining and error handling",
          "async/await syntax and try/catch",
          "Common async pitfalls and debugging"
        ]
      },
      {
        week: "Week 2",
        topics: [
          "Fetching data with the Fetch API",
          "Working with JSON responses",
          "ES Modules: import/export",
          "Handling errors and loading states in API calls"
        ]
      }
    ]
  },
  {
    id: "react",
    title: "React Fundamentals",
    type: "course",
    skills: ["React", "JavaScript", "Frontend"],
    prerequisites: ["JavaScript"],
    level: "intermediate",
    duration: "3 weeks",
    description: "Components, props, state, hooks, routing and reusable UI.",
    curriculum: [
      {
        week: "Week 1",
        topics: [
          "JSX syntax and rendering elements",
          "Building function components",
          "Props and component composition"
        ]
      },
      {
        week: "Week 2",
        topics: [
          "State with useState",
          "Handling events and forms",
          "Conditional rendering and rendering lists (keys)"
        ]
      },
      {
        week: "Week 3",
        topics: [
          "Side effects with useEffect",
          "Client-side routing with React Router",
          "Building and structuring a small multi-page app"
        ]
      }
    ]
  },
  {
    id: "node",
    title: "Node.js & Express",
    type: "course",
    skills: ["Node.js", "Express", "Backend", "REST APIs"],
    prerequisites: ["JavaScript"],
    level: "intermediate",
    duration: "3 weeks",
    description: "Build REST APIs, middleware and server-side applications.",
    curriculum: [
      {
        week: "Week 1",
        topics: [
          "The Node.js runtime and module system",
          "npm, package.json and dependency management",
          "Reading/writing files and working with the file system module"
        ]
      },
      {
        week: "Week 2",
        topics: [
          "Setting up an Express server",
          "Routing and route parameters",
          "Middleware: built-in, third-party and custom"
        ]
      },
      {
        week: "Week 3",
        topics: [
          "Building full REST endpoints (GET/POST/PUT/DELETE)",
          "Request validation and error handling",
          "Connecting an Express app to a database"
        ]
      }
    ]
  },
  {
    id: "mongodb",
    title: "MongoDB Essentials",
    type: "course",
    skills: ["MongoDB", "Databases"],
    prerequisites: ["Node.js"],
    level: "intermediate",
    duration: "2 weeks",
    description: "Collections, CRUD, queries, indexes and application integration.",
    curriculum: [
      {
        week: "Week 1",
        topics: [
          "Documents, collections and the MongoDB data model",
          "CRUD operations: insert, find, update, delete",
          "Query operators and filtering"
        ]
      },
      {
        week: "Week 2",
        topics: [
          "Indexes and query performance",
          "Schema design basics for NoSQL",
          "Integrating MongoDB into a Node.js app with Mongoose"
        ]
      }
    ]
  },
  {
    id: "mern-project",
    title: "MERN Full-Stack Project",
    type: "project",
    skills: ["React", "Node.js", "MongoDB", "REST APIs"],
    prerequisites: ["React", "Node.js", "MongoDB"],
    level: "intermediate",
    duration: "3 weeks",
    description: "Build and deploy a complete full-stack application.",
    curriculum: [
      {
        week: "Week 1",
        topics: [
          "Planning app features and data models",
          "Project setup: React frontend + Express backend + MongoDB",
          "Designing the REST API contract"
        ]
      },
      {
        week: "Week 2",
        topics: [
          "Building the API and database layer",
          "Implementing authentication basics",
          "Connecting the React frontend to the API"
        ]
      },
      {
        week: "Week 3",
        topics: [
          "Polishing UI/UX and handling loading/error states",
          "Testing the full flow end to end",
          "Deploying frontend and backend"
        ]
      }
    ]
  },
  {
    id: "web-assessment",
    title: "Web Development Skill Assessment",
    type: "assessment",
    skills: ["JavaScript", "React", "Node.js"],
    prerequisites: ["JavaScript"],
    level: "intermediate",
    duration: "1 day",
    description: "Assess frontend and backend fundamentals.",
    instructions: "Answer the questions below for each skill. Your scores update your profile and refine future recommendations."
  },
  {
    id: "python-basics",
    title: "Python Programming Basics",
    type: "course",
    skills: ["Python", "Programming"],
    prerequisites: [],
    level: "beginner",
    duration: "2 weeks",
    description: "Syntax, conditions, loops, functions, collections and files.",
    curriculum: [
      {
        week: "Week 1",
        topics: [
          "Python syntax, variables and data types",
          "Conditionals (if/elif/else)",
          "Loops (for, while) and iteration"
        ]
      },
      {
        week: "Week 2",
        topics: [
          "Writing functions and default arguments",
          "Collections: lists, tuples, dictionaries, sets",
          "Reading and writing files"
        ]
      }
    ]
  },
  {
    id: "ml-foundations",
    title: "Machine Learning Foundations",
    type: "course",
    skills: ["Python", "Machine Learning", "Statistics"],
    prerequisites: ["Python"],
    level: "intermediate",
    duration: "4 weeks",
    description: "Data preprocessing, regression, classification and evaluation.",
    curriculum: [
      {
        week: "Week 1",
        topics: [
          "What is machine learning: supervised vs unsupervised",
          "Data cleaning and preprocessing",
          "Exploratory data analysis"
        ]
      },
      {
        week: "Week 2",
        topics: [
          "Linear regression",
          "Feature scaling and engineering basics",
          "Train/test splits"
        ]
      },
      {
        week: "Week 3",
        topics: [
          "Classification algorithms (logistic regression, k-NN)",
          "Decision boundaries and overfitting",
          "Hyperparameters basics"
        ]
      },
      {
        week: "Week 4",
        topics: [
          "Evaluation metrics (accuracy, precision, recall, F1)",
          "Cross-validation",
          "Choosing the right model for a problem"
        ]
      }
    ]
  },
  {
    id: "ml-project",
    title: "ML Prediction Project",
    type: "project",
    skills: ["Python", "Machine Learning"],
    prerequisites: ["Machine Learning"],
    level: "intermediate",
    duration: "2 weeks",
    description: "Train, evaluate and document an end-to-end ML model.",
    curriculum: [
      {
        week: "Week 1",
        topics: [
          "Framing the prediction problem and choosing a dataset",
          "Data cleaning and feature preparation",
          "Selecting and training a baseline model"
        ]
      },
      {
        week: "Week 2",
        topics: [
          "Tuning the model and comparing alternatives",
          "Evaluating results against metrics",
          "Documenting the process and findings"
        ]
      }
    ]
  },
  {
  id: "student-performance-project",
  title: "Student Performance Prediction",
  type: "project",
  skills: [
    "Python",
    "Statistics",
    "Machine Learning"
  ],
  prerequisites: [
    "Python",
    "Statistics",
    "Machine Learning"
  ],
  level: "intermediate",
  duration: "2 weeks",
  description:
    "Build a machine learning model to predict student academic performance.",
  curriculum: [
    {
      week: "Week 1",
      topics: [
        "Collecting and exploring a student performance dataset",
        "Cleaning data and handling missing values",
        "Feature selection (attendance, grades, study habits, etc.)"
      ]
    },
    {
      week: "Week 2",
      topics: [
        "Training a regression/classification model",
        "Evaluating prediction accuracy",
        "Summarizing insights in a short report"
      ]
    }
  ]
},

{
  id: "ai-chatbot-project",
  title: "AI Learning Chatbot",
  type: "project",
  skills: [
    "Python",
    "Machine Learning"
  ],
  prerequisites: [
    "Python",
    "Machine Learning"
  ],
  level: "advanced",
  duration: "3 weeks",
  description:
    "Build an AI chatbot that answers learner questions and provides study guidance.",
  curriculum: [
    {
      week: "Week 1",
      topics: [
        "Chatbot architecture and conversation design",
        "Defining intents and sample learner questions",
        "Choosing an approach: rules-based vs ML-based responses"
      ]
    },
    {
      week: "Week 2",
      topics: [
        "Building the response/matching logic",
        "Adding study-guidance and recommendation features",
        "Handling unclear or out-of-scope questions"
      ]
    },
    {
      week: "Week 3",
      topics: [
        "Integrating the chatbot into an app or interface",
        "Testing with real learner questions",
        "Iterating based on feedback"
      ]
    }
  ]
}
];