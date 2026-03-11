import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  ArrowUpCircle,
  Eye,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { supabase } from "../../services/authService";

const EarningsPayment = () => {
  const [activeTab, setActiveTab] = useState<"transactions" | "orders">(
    "transactions"
  );
  const [showEarnings, setShowEarnings] = useState(true);
  const [currentPage, setCurrentPage] = useState<"main" | "payment">("main");
  const [selectedBank, setSelectedBank] = useState("Guaranty Trust Bank");
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: vendor } = await supabase
          .from("vendors")
          .select("id, business_name")
          .eq("user_id", session.user.id)
          .single();

        if (!vendor) return;

        // Fetch all completed orders as transactions
        const { data: orderData } = await supabase
          .from("orders")
          .select("id, total_amount, status, created_at, customer_name")
          .eq("vendor_id", vendor.id)
          .order("created_at", { ascending: false });

        if (orderData) {
          const total = orderData
            .filter(o => o.status === "completed" || o.status === "delivered")
            .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
          setTotalEarnings(total);

          // Format as transactions
          setTransactions(orderData.map((o, i) => ({
            id: i + 1,
            title: `Order from ${o.customer_name || "Customer"}`,
            amount: Number(o.total_amount) || 0,
            commission: Math.round((Number(o.total_amount) || 0) * 0.1),
            date: new Date(o.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }),
            status: o.status,
          })));

          // Format as orders list
          setOrders(orderData.map((o, i) => ({
            id: i + 1,
            orderNo: `#${o.id.slice(0, 5).toUpperCase()}`,
            amount: Number(o.total_amount) || 0,
            commission: Math.round((Number(o.total_amount) || 0) * 0.1),
            date: new Date(o.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }),
            status: o.status,
          })));
        }

        // Fetch bank info if exists
        const { data: bankData } = await supabase
          .from("vendor_bank_info")
          .select("*")
          .eq("vendor_id", vendor.id)
          .maybeSingle();

        if (bankData) {
          setSelectedBank(bankData.bank_name || "Guaranty Trust Bank");
          setBankName(bankData.account_name || "");
          setAccountNo(bankData.account_number || "");
        }
      } catch (err) {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  const banks = [
    "Guaranty Trust Bank",
    "Access Bank",
    "First Bank of Nigeria",
    "Zenith Bank",
    "United Bank for Africa",
    "Fidelity Bank",
  ];

  const handleSave = () => {
    // Save logic here
    setCurrentPage("main");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (currentPage === "payment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <VendorNav />
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage("main")}
                className="hover:bg-white/10 p-2 rounded-full transition-all duration-300 transform hover:scale-110"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-semibold">Earnings and Payment</h1>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Earnings Card */}
          <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 transform hover:scale-[1.02] transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <span className="text-sm">Today's Earning</span>
                <ChevronDown size={16} className="animate-bounce" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">₦</span>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 tracking-tight">
                    {showEarnings ? `₦ ${totalEarnings.toLocaleString()}` : "₦ ••••••"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Pending Payout -{" "}
                    <span className="text-green-600 font-semibold">
                      ₦ {Math.round(totalEarnings * 0.9).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start">
                <button
                  onClick={() => setShowEarnings(!showEarnings)}
                  className="bg-green-50 p-2 sm:p-3 rounded-full hover:bg-green-100 transition-all duration-300 transform hover:scale-110"
                >
                  <Eye size={18} className="sm:w-5 sm:h-5 text-green-600" />
                </button>
                <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 px-2 sm:px-3 py-2 rounded-full shadow-md">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white"></div>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-300"></div>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-300"></div>
                </div>
                <button className="bg-green-50 p-2 sm:p-3 rounded-full hover:bg-green-100 transition-all duration-300 transform hover:scale-110 hover:rotate-90">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="sm:w-5 sm:h-5"
                  >
                    <path
                      d="M10 4L10 16M4 10L16 10"
                      stroke="#16a34a"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            {/* Select Bank */}
            <div>
              <label className="inline-block bg-green-600 text-white text-xs px-3 py-1 rounded-t-lg font-medium">
                Select bank
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  #
                </span>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-2xl px-12 py-4 text-gray-700 font-medium focus:border-green-500 focus:outline-none transition-all duration-300 appearance-none cursor-pointer hover:border-green-300"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2316a34a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  {banks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
                Bank name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  #
                </span>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Enter bank name"
                  className="w-full bg-white border-2 border-gray-200 rounded-2xl px-12 py-4 text-gray-700 font-medium focus:border-green-500 focus:outline-none transition-all duration-300 hover:border-green-300"
                />
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
                Account No:
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  #
                </span>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="Enter account number"
                  className="w-full bg-white border-2 border-gray-200 rounded-2xl px-12 py-4 text-gray-700 font-medium focus:border-green-500 focus:outline-none transition-all duration-300 hover:border-green-300"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 pb-8">
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <VendorNav />
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button className="hover:bg-white/10 p-2 rounded-full transition-all duration-300 transform hover:scale-110">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold">Earnings and Payment</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-green-300 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-green-300 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Earnings Card */}
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 transform hover:scale-[1.02] transition-all duration-300 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <span className="text-sm">Today's Earning</span>
              <ChevronDown size={16} className="animate-bounce" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <span className="text-white text-2xl font-bold">₦</span>
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 tracking-tight">
                  {showEarnings ? "₦ 3,027.87" : "₦ ••••••"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Pending Payout -{" "}
                  <span className="text-green-600 font-semibold">
                    ₦ 2859.87
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start">
              <button
                onClick={() => setShowEarnings(!showEarnings)}
                className="bg-green-50 p-2 sm:p-3 rounded-full hover:bg-green-100 transition-all duration-300 transform hover:scale-110"
              >
                <Eye size={18} className="sm:w-5 sm:h-5 text-green-600" />
              </button>
              <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 px-2 sm:px-3 py-2 rounded-full shadow-md">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-300"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-300"></div>
              </div>
              <button className="bg-green-50 p-2 sm:p-3 rounded-full hover:bg-green-100 transition-all duration-300 transform hover:scale-110 hover:rotate-90">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="sm:w-5 sm:h-5"
                >
                  <path
                    d="M10 4L10 16M4 10L16 10"
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Update Payment Info */}
        <button
          onClick={() => setCurrentPage("payment")}
          className="w-full bg-white rounded-2xl shadow-md p-4 sm:p-5 flex items-center justify-between hover:shadow-xl transition-all duration-300 transform hover:translate-x-2 border border-gray-100"
        >
          <span className="text-gray-700 font-medium text-sm sm:text-base">
            Update Payment Info
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="sm:w-6 sm:h-6"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-2 border border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "transactions"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "orders"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Orders
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center justify-end gap-2 text-gray-600 text-sm">
          <span className="font-medium">21st May - 25th Aug</span>
          <Calendar
            size={16}
            className="text-green-600 sm:w-[18px] sm:h-[18px]"
          />
        </div>

        {/* List Items */}
        <div className="space-y-3">
          {activeTab === "transactions" ? (
            <>
              {transactions.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-md p-4 sm:p-5 hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                      <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 sm:p-4 rounded-2xl shadow-md transform hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                        <ArrowUpCircle
                          size={20}
                          className="text-green-600 sm:w-6 sm:h-6"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base truncate">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {item.date}
                          </span>
                          <span className="bg-green-500 text-white text-xs px-2 sm:px-3 py-1 rounded-full font-medium shadow-sm">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right pl-11 sm:pl-0">
                      <p className="text-lg sm:text-xl font-bold text-gray-800">
                        -₦{item.amount.toLocaleString()}
                      </p>
                      <p className="text-xs sm:text-sm text-green-600 font-medium">
                        Commission - ₦{item.commission.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {orders.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-md p-4 sm:p-5 hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                      <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 sm:p-4 rounded-2xl shadow-md transform hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                        <ArrowUpCircle
                          size={20}
                          className="text-green-600 sm:w-6 sm:h-6"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">
                          ORDER - {item.orderNo}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {item.date}
                          </span>
                          <span className="bg-green-500 text-white text-xs px-2 sm:px-3 py-1 rounded-full font-medium shadow-sm">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right pl-11 sm:pl-0">
                      <p className="text-lg sm:text-xl font-bold text-gray-800">
                        -₦{item.amount.toLocaleString()}
                      </p>
                      <p className="text-xs sm:text-sm text-green-600 font-medium">
                        Commission - ₦{item.commission.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-8">
          <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1">
            Request Withdrawal
          </button>
          <button className="w-full bg-gradient-to-r from-blue-50 to-green-50 text-green-600 py-4 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-2 border-green-200">
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarningsPayment;
