
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [message, setMessage] = useState("");
    let navigate = useNavigate();

    let handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            let req = await fetch("http://localhost:3000/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            let res = await req.json();
            console.log(res);

            if (req.ok && res.user) {
                localStorage.setItem(
                    "currentuser",
                    JSON.stringify(res.user)
                );

                if (res.user.role === "ADMIN") {
                    navigate("/adminhome");
                } else {
                    navigate("/userhome");
                }
            } else {
                setMessage(res.message || res.msg || "Invalid email or password");
            }

        } catch (error) {
            console.log(error);
            setMessage("Unable to connect to the server");
        }
    };

    return (
        <div>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                />
                <br />

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                />
                <br />

                <button type="submit">Login</button>
            </form>

            <p>{message}</p>
        </div>
    );
}

export default Login;
