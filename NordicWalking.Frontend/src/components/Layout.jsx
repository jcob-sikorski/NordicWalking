import Navbar from "./Navbar";

const Layout = ({ children }) => {
    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 pt-16 overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default Layout;