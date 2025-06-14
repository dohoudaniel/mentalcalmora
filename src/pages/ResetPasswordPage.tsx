
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResetPassword from "@/components/ResetPassword";

const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-mint-mist">
        <ResetPassword />
      </main>
      
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
