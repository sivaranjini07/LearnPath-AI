const questionBank = {
  JavaScript: [
    {
      question: "What does typeof [] return?",
      options: ["array", "object", "list", "undefined"],
      correctIndex: 1
    },
    {
      question: "Which keyword declares a block-scoped variable?",
      options: ["var", "let", "global", "def"],
      correctIndex: 1
    },
    {
      question: "Which method converts JSON text into a JavaScript object?",
      options: [
        "JSON.parse()",
        "JSON.stringify()",
        "JSON.convert()",
        "JSON.object()"
      ],
      correctIndex: 0
    },
    {
      question: "Which symbol is used for strict equality?",
      options: ["=", "==", "===", "!="],
      correctIndex: 2
    },
    {
      question: "Which feature was introduced with ES6?",
      options: [
        "let and const",
        "HTML",
        "CSS",
        "XML"
      ],
      correctIndex: 0
    }
  ],

  React: [
    {
      question: "Which hook is used to add state to a function component?",
      options: ["useEffect", "useState", "useRef", "useMemo"],
      correctIndex: 1
    },
    {
      question: "Reusable UI pieces in React are called?",
      options: ["Modules", "Components", "Templates", "Widgets"],
      correctIndex: 1
    },
    {
      question: "Which prop is used to uniquely identify list elements?",
      options: ["id", "key", "index", "unique"],
      correctIndex: 1
    },
    {
      question: "Which hook is commonly used for side effects?",
      options: ["useState", "useEffect", "useData", "useComponent"],
      correctIndex: 1
    },
    {
      question: "React applications are primarily built using?",
      options: ["Components", "Tables", "SQL", "Controllers"],
      correctIndex: 0
    }
  ],

  "Node.js": [
    {
      question: "Node.js is primarily built on which JavaScript engine?",
      options: ["SpiderMonkey", "V8", "Chakra", "JavaScriptCore"],
      correctIndex: 1
    },
    {
      question: "Node.js is mainly used for?",
      options: [
        "Server-side JavaScript",
        "Database design only",
        "CSS styling",
        "Image editing"
      ],
      correctIndex: 0
    },
    {
      question: "Which command initializes a Node project?",
      options: [
        "node start",
        "npm init",
        "node init",
        "npm create-node"
      ],
      correctIndex: 1
    },
    {
      question: "Which object is used to work with environment variables?",
      options: ["process.env", "node.env", "environment", "config.env"],
      correctIndex: 0
    },
    {
      question: "Node.js uses which programming language?",
      options: ["Python", "Java", "JavaScript", "C++"],
      correctIndex: 2
    }
  ],

  Express: [
    {
      question: "What is Express?",
      options: [
        "A database",
        "A Node.js web framework",
        "A frontend library",
        "A programming language"
      ],
      correctIndex: 1
    },
    {
      question: "What is Express middleware?",
      options: [
        "Database connector",
        "Function with access to req, res and next",
        "CSS framework",
        "Route parameter"
      ],
      correctIndex: 1
    },
    {
      question: "Which method creates a GET route?",
      options: [
        "app.get()",
        "app.fetch()",
        "app.routeGet()",
        "app.request()"
      ],
      correctIndex: 0
    }
  ],

  "REST APIs": [
    {
      question: "Which HTTP method is normally used to retrieve data?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correctIndex: 0
    },
    {
      question: "Which HTTP method is normally used to create data?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correctIndex: 1
    },
    {
      question: "Which HTTP status code means 'Not Found'?",
      options: ["200", "201", "404", "500"],
      correctIndex: 2
    },
    {
      question: "Which format is commonly used for API responses?",
      options: ["JSON", "PSD", "EXE", "MP3"],
      correctIndex: 0
    }
  ],

  MongoDB: [
    {
      question: "MongoDB is a?",
      options: [
        "Relational database",
        "NoSQL database",
        "Programming language",
        "Web browser"
      ],
      correctIndex: 1
    },
    {
      question: "MongoDB stores records as?",
      options: [
        "Documents",
        "Rows only",
        "Classes",
        "Functions"
      ],
      correctIndex: 0
    },
    {
      question: "A group of MongoDB documents is called?",
      options: [
        "Table",
        "Collection",
        "Schema",
        "Row"
      ],
      correctIndex: 1
    },
    {
      question: "Which command inserts a document?",
      options: [
        "insertOne()",
        "addRow()",
        "insertRow()",
        "createRecord()"
      ],
      correctIndex: 0
    }
  ],

  Python: [
    {
      question: "Which symbol starts a comment in Python?",
      options: ["//", "#", "/*", "--"],
      correctIndex: 1
    },
    {
      question: "Which data type stores key-value pairs?",
      options: ["List", "Tuple", "Dictionary", "Set"],
      correctIndex: 2
    },
    {
      question: "Which keyword defines a function?",
      options: ["function", "def", "fun", "define"],
      correctIndex: 1
    },
    {
      question: "Which function displays output?",
      options: ["display()", "console()", "print()", "show()"],
      correctIndex: 2
    },
    {
      question: "Python is?",
      options: [
        "Statically typed only",
        "Dynamically typed",
        "Markup language",
        "Database"
      ],
      correctIndex: 1
    }
  ],

  Statistics: [
    {
      question: "Mean is calculated as?",
      options: [
        "Sum / Number of values",
        "Maximum - Minimum",
        "Middle value only",
        "Square root of values"
      ],
      correctIndex: 0
    },
    {
      question: "Which measure represents the middle value?",
      options: ["Mean", "Median", "Variance", "Range"],
      correctIndex: 1
    },
    {
      question: "Standard deviation measures?",
      options: [
        "Central tendency",
        "Spread of data",
        "Number of records",
        "Maximum value"
      ],
      correctIndex: 1
    }
  ],

  "Machine Learning": [
    {
      question: "Which is a supervised learning algorithm?",
      options: [
        "Linear Regression",
        "K-Means",
        "PCA",
        "Apriori"
      ],
      correctIndex: 0
    },
    {
      question: "Classification predicts?",
      options: [
        "Categories",
        "Only continuous values",
        "Database rows",
        "Images only"
      ],
      correctIndex: 0
    },
    {
      question: "Which algorithm is used for clustering?",
      options: [
        "K-Means",
        "Linear Regression",
        "Logistic Regression",
        "Naive Bayes"
      ],
      correctIndex: 0
    },
    {
      question: "What is overfitting?",
      options: [
        "Model performs well only on training data",
        "Model has no data",
        "Model has too few features",
        "Model cannot train"
      ],
      correctIndex: 0
    },
    {
      question: "Which library is commonly used for ML in Python?",
      options: [
        "Scikit-learn",
        "Express",
        "React",
        "Mongoose"
      ],
      correctIndex: 0
    }
  ]
};

export default questionBank;