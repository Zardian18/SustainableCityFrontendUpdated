// import React, { useState } from "react";
// import "../pages/AuthPage.css";

// const AuthPage = () => {
//   const query = new URLSearchParams(window.location.search);
//   const defaultMode = query.get("mode") === "signup" ? false : true;
//   const [isSignIn, setIsSignIn] = useState(defaultMode);

//   const toggleForm = () => setIsSignIn(!isSignIn);

//   return (
//     <div className="auth-container">
//       {/* Header from Landing Page */}
//       <header className="header">
//         <h1 className="logo" onClick={() => window.location.href = "/"}>EIRFLOW</h1>
//         <nav className="nav">
//           <button onClick={() => window.location.href = "/#about"}>About</button>
//           <button onClick={() => window.location.href = "/#contact"}>Contact</button>
//         </nav>
//       </header>

//       {/* Auth Card */}
//       <div className="auth-card">
//         <div className="auth-toggle">
//           <button
//             className={`toggle-btn ${isSignIn ? "active" : ""}`}
//             onClick={() => setIsSignIn(true)}
//           >
//             Sign In
//           </button>
//           <button
//             className={`toggle-btn ${!isSignIn ? "active" : ""}`}
//             onClick={() => setIsSignIn(false)}
//           >
//             Sign Up
//           </button>
//         </div>

//         {isSignIn ? (
//           <form className="auth-form">
//             <input type="text" placeholder="Username" required />
//             <input type="password" placeholder="Password" required />
//             <div className="auth-extras">
//               <label><input type="checkbox" /> Remember Me</label>
//               <a href="#">Forgot Password?</a>
//             </div>
//             <button type="submit" className="submit-btn">Login</button>
//           </form>
//         ) : (
//           <form className="auth-form">
//             <input type="text" placeholder="Supervisor Name" required />
//             <select required>
//               <option value="">Mode of Transport</option>
//               <option value="bus">Bus</option>
//               <option value="bike">Bike</option>
//               <option value="pedestrian">Pedestrian</option>
//             </select>
//             <input type="text" placeholder="Username" required />
//             <input type="password" placeholder="Password" required />
//             <select required>
//               <option value="">Security Question</option>
//               <option value="pet">What is your pet's name?</option>
//               <option value="school">What was your first school?</option>
//             </select>
//             <input type="text" placeholder="Security Answer" required />
//             <button type="submit" className="submit-btn">Register</button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuthPage;

import React, { useState } from "react";
import "../pages/AuthPage.css";
import authBanner from "../assets/signup.png";
import axios from "axios";

const AuthPage = () => {
  const query = new URLSearchParams(window.location.search);
  const defaultMode = query.get("mode") === "signup" ? false : true;
  const [isSignIn, setIsSignIn] = useState(defaultMode);

  const [formData, setFormData] = useState({
    supervisorName: "",
    role: "",
    mode: "",
    username: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Register Form
  const handleRegister = async (e) => {
    e.preventDefault();

    const register_payload = {
      supervisor_name: formData.supervisorName,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      mode: formData.mode,
      security_question: formData.securityQuestion,
      security_answer: formData.securityAnswer,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", register_payload);
      alert(res.data.message);
      setIsSignIn(true); // Redirect to Sign In
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const login_payload = {
      username: formData.username,
      password: formData.password,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", login_payload);
      alert(res.data.message);
      localStorage.setItem("token", res.data.token); // Store JWT
      // Redirect to dashboard or home page
      window.location.href = "/dashboard"; // Change this route as needed
    } catch (err) {
      alert(err.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div className="auth-container">
      {/* Header from Landing Page */}
      <header className="header">
        <h1 className="logo" onClick={() => window.location.href = "/"}>Éirflow</h1>
        <nav className="nav">
          <button onClick={() => window.location.href = "/#about"}>About</button>
          <button onClick={() => window.location.href = "/#contact"}>Contact</button>
        </nav>
      </header>

      {/* Main auth layout */}
      <div className="auth-layout">
        {/* Left side: form card */}
        <div className="auth-card">
          <div className="auth-toggle">
            <button
              className={`toggle-btn ${isSignIn ? "active" : ""}`}
              onClick={() => setIsSignIn(true)}
            >
              Sign In
            </button>
            <button
              className={`toggle-btn ${!isSignIn ? "active" : ""}`}
              onClick={() => setIsSignIn(false)}
            >
              Sign Up
            </button>
          </div>

          {isSignIn ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <input type="text" name="username" placeholder="Username" required />
              <input type="password" name="password" placeholder="Password" required />
              <div className="auth-extras">
                <label><input type="checkbox" /> Remember Me</label>
                <a href="#">Forgot Password?</a>
              </div>
              <button type="submit" className="submit-btn">Login</button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <input type="text" name="supervisorName" placeholder="Supervisor Name" value={formData.supervisorName} onChange={handleChange} required />
              
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="">Role</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Manager</option>
              </select>

              <select name="mode" value={formData.mode} onChange={handleChange} required>
                <option value="">Mode of Transport</option>
                <option value="bus">Bus</option>
                <option value="bike">Bike</option>
                <option value="pedestrian">Events</option>
              </select>

              <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

              <select name="securityQuestion" value={formData.securityQuestion} onChange={handleChange} required>
                <option value="">Security Question</option>
                <option value="pet">What is your pet's name?</option>
                <option value="school">What was your first school?</option>
              </select>
              <input type="text" name="securityAnswer" placeholder="Security Answer" value={formData.securityAnswer} onChange={handleChange} required />

              <button type="submit" className="submit-btn">Register</button>
            </form>
          )}
        </div>

        {/* Right side: image */}
        <div className="auth-image">
          <img src={authBanner} alt="Auth Visual" />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
