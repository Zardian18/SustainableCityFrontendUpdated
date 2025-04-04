import React, { useState, useEffect } from "react";
import "../pages/AuthPage.css";
import authBanner from "../assets/signup.png";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
	const navigate = useNavigate();
	const query = new URLSearchParams(window.location.search);
	const defaultMode = query.get("mode") === "signup" ? false : true;
	const [isSignIn, setIsSignIn] = useState(defaultMode);
	const [rememberMe, setRememberMe] = useState(false);
	const [formData, setFormData] = useState({
		supervisorName: "",
		role: "",
		mode: "",
		username: "",
		password: "",
		securityQuestion: "",
		securityAnswer: "",
	});

	useEffect(() => {
		const rememberedUsername = Cookies.get("rememberedUsername");
		const rememberedPassword = Cookies.get("rememberedPassword");

		if (rememberedUsername && rememberedPassword) {
			setFormData((prev) => ({
				...prev,
				username: rememberedUsername,
				password: rememberedPassword,
			}));
			setRememberMe(true);
		}
	}, []);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleCheckbox = (e) => {
		setRememberMe(e.target.checked);
	};

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
			user_type: formData.role,
		};

		try {
			const res = await axios.post(
				"http://localhost:5000/api/auth/register",
				register_payload
			);
			alert(res.data.message);
			setIsSignIn(true);
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
			const res = await axios.post(
				"http://localhost:5000/api/auth/login",
				login_payload
			);
			alert(res.data.message);

			const token = res.data.token;
			const decoded = jwtDecode(token);

			// Store token in cookies (optional)
			Cookies.set("token", token, { expires: 1 }); // 1 day
			Cookies.set("username", res.data.username);
			Cookies.set("role", decoded.role);
			Cookies.set("mode", decoded.mode);

			// Store user in Zustand
			const setUser = useAuthStore.getState().setUser;
			setUser({
				username: res.data.username,
				role: decoded.role,
				mode: decoded.mode,
			});

			// Store remembered credentials
			if (rememberMe) {
				Cookies.set("rememberedUsername", formData.username, { expires: 7 });
				Cookies.set("rememberedPassword", formData.password, { expires: 7 });
			} else {
				Cookies.remove("rememberedUsername");
				Cookies.remove("rememberedPassword");
			}

			navigate("/dashboard"); // ⬅️ If using React Router
			// OR fallback:
			// window.location.href = "/dashboard"; ❌ (this clears in-memory state without persist)
		} catch (err) {
			alert(err.response?.data?.error || "Login failed.");
		}
	};

	return (
		<div className="auth-container">
			<header className="header">
				<h1 className="logo" onClick={() => (window.location.href = "/")}>
					Éirflow
				</h1>
				<nav className="nav">
					<button onClick={() => (window.location.href = "/#about")}>
						About
					</button>
					<button onClick={() => (window.location.href = "/#contact")}>
						Contact
					</button>
				</nav>
			</header>

			<div className="auth-layout">
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
							<input
								type="text"
								name="username"
								placeholder="Username"
								value={formData.username}
								onChange={handleChange}
								required
							/>
							<input
								type="password"
								name="password"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
								required
							/>
							<div className="auth-extras">
								<label>
									<input
										type="checkbox"
										checked={rememberMe}
										onChange={handleCheckbox}
									/>
									Remember Me
								</label>
								<a href="/forgot-password">Forgot Password?</a>
							</div>
							<button type="submit" className="submit-btn">
								Login
							</button>
						</form>
					) : (
						<form className="auth-form" onSubmit={handleRegister}>
							<select
								name="role"
								value={formData.role}
								onChange={handleChange}
								required
							>
								<option value="">Role</option>
								<option value="supervisor">Supervisor</option>
								<option value="manager">Manager</option>
								<option value="user">User</option>
							</select>
							<input
								type="text"
								name="supervisorName"
								placeholder={
									formData.role === "supervisor"
										? "Supervisor Name"
										: formData.role === "manager"
										? "Manager Name"
										: "User Name"
								}
								value={formData.supervisorName}
								onChange={handleChange}
								required
							/>
							<select
								name="mode"
								value={formData.mode}
								onChange={handleChange}
								required
								disabled={
									formData.role === "manager" || formData.role === "user"
								}
							>
								<option value="">Mode of Transport</option>
								<option value="bus">Bus</option>
								<option value="bike">Bike</option>
								<option value="pedestrian">Events</option>
							</select>
							<input
								type="text"
								name="username"
								placeholder="Username"
								value={formData.username}
								onChange={handleChange}
								required
							/>
							<input
								type="password"
								name="password"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
								required
							/>
							<select
								name="securityQuestion"
								value={formData.securityQuestion}
								onChange={handleChange}
								required
							>
								<option value="">Security Question</option>
								<option value="pet">What is your pet's name?</option>
								<option value="school">What was your first school?</option>
							</select>
							<input
								type="text"
								name="securityAnswer"
								placeholder="Security Answer"
								value={formData.securityAnswer}
								onChange={handleChange}
								required
							/>
							<button type="submit" className="submit-btn">
								Register
							</button>
						</form>
					)}
				</div>

				<div className="auth-image">
					<img src={authBanner} alt="Auth Visual" />
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
