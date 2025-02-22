// Tabs.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Tabs = () => {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-black">
            {/* 左边的大标题 */}
            <h1 className="text-3xl font-bold text-white">
                <span className="text-green-500">L</span>IFE IS <span className="text-green-500">U</span>RGENT, <span className="text-green-500">L</span>IFE IS <span className="text-green-500">N</span>OW
            </h1>

            {/* 右边的导航链接（Tab） */}
            <nav className="flex space-x-6">
                <NavLink
                    to="/life-expectancy"
                    className={({ isActive }) =>
                        "text-lg font-semibold transition " +
                        (isActive
                            ? "text-green-400 border-b-2 border-green-400"
                            : "text-gray-300 hover:text-white")
                    }
                >
                    Life Expectancy
                </NavLink>
                <NavLink
                    to="/vo2max"
                    className={({ isActive }) =>
                        "text-lg font-semibold transition " +
                        (isActive
                            ? "text-green-400 border-b-2 border-green-400"
                            : "text-gray-300 hover:text-white")
                    }
                >
                    VO₂ Max
                </NavLink>
                <NavLink
                    to="/Chronic Disease"
                    className={({ isActive }) =>
                        "text-lg font-semibold transition " +
                        (isActive
                            ? "text-green-400 border-b-2 border-green-400"
                            : "text-gray-300 hover:text-white")
                    }
                >
                   Chronic Disease
                </NavLink>
                <NavLink
                    to="/Causes Of Death"
                    className={({ isActive }) =>
                        "text-lg font-semibold transition " +
                        (isActive
                            ? "text-green-400 border-b-2 border-green-400"
                            : "text-gray-300 hover:text-white")
                    }
                >
                   Causes Of Death
                </NavLink>
            </nav>
        </header>
    );
};

export default Tabs;