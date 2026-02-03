import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to My App</h1>
                <p className="text-gray-600 mb-8">Please login or create a new account</p>

                <div className="flex gap-4 justify-center">
                    <Link
                        to="/login"
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                    >
                        Signup
                    </Link>
                </div>
            </div>
        </div>
    );
}
