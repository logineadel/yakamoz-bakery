import { useState } from "react";
import emailjs from "@emailjs/browser";
import logoImg from "@/imports/attach_c0609e2e.jpeg";
import browniesImg from "@/imports/attach_39b4b2a1.jpeg";
import imgChocCookie from "@/imports/prod_3.jpg";
import imgNutellaCookie from "@/imports/prod_10.jpg";
import imgOreoCookie from "@/imports/prod_9.jpg";
import imgMiniCup from "@/imports/prod_7.jpg";
import imgNutellaCookieCake from "@/imports/prod_6.jpg";
import imgMoltenCake from "@/imports/prod_5.jpg";
import imgOriginalBrownie from "@/imports/prod_4.jpg";
import imgNutellaBrownie from "@/imports/prod_2.jpg";
import imgKinderCookies from "@/imports/prod_8.jpg";
import imgBox from "@/imports/prod_1.jpg";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  tag: string;
  category: "Cookies" | "Brownies" | "Cakes" | "Boxes";
};

type CartItem = Product & { qty: number; boxSize?: 1 | 2 };

type Page = "shop" | "cart" | "checkout" | "confirmation";

const PRODUCTS: Product[] = [
  // Cookies
  {
    id: 1,
    name: "Chocolate Cookie",
    description: "Rich, dense chocolate cookie with deep cocoa flavor, chocolate chunks and a sprinkle of sea salt.",
    price: 60,
    image: imgChocCookie,
    tag: "Bestseller",
    category: "Cookies",
  },
  {
    id: 2,
    name: "Nutella Cookie",
    description: "Soft cookie topped with a swirl of Nutella and crushed hazelnuts. Irresistibly gooey.",
    price: 70,
    image: imgNutellaCookie,
    tag: "Popular",
    category: "Cookies",
  },
  {
    id: 3,
    name: "Oreo Cookie",
    description: "Dark chocolate cookie stuffed with Oreo cream and topped with crumbled Oreos.",
    price: 70,
    image: imgOreoCookie,
    tag: "Fan Favorite",
    category: "Cookies",
  },
  {
    id: 4,
    name: "Mini Cookies Cup",
    description: "A generous cup of assorted mini cookies — perfect for sharing or solo snacking.",
    price: 70,
    image: imgMiniCup,
    tag: "New",
    category: "Cookies",
  },
  {
    id: 5,
    name: "Kinder Cookies",
    description: "Bite-sized chocolate cookies loaded with Kinder chocolate pieces. Addictively good.",
    price: 70,
    image: imgKinderCookies,
    tag: "Popular",
    category: "Cookies",
  },
  // Cakes
  {
    id: 6,
    name: "Nutella Cookie Cake",
    description: "A showstopping giant cookie cake smothered in Nutella. Serves 4 people.",
    price: 500,
    image: imgNutellaCookieCake,
    tag: "Serves 4",
    category: "Cakes",
  },
  {
    id: 7,
    name: "Molten Cake",
    description: "Warm chocolate molten cake with a flowing liquid chocolate core. Pure indulgence.",
    price: 150,
    image: imgMoltenCake,
    tag: "Premium",
    category: "Cakes",
  },
  // Brownies
  {
    id: 8,
    name: "Original Brownie",
    description: "Classic fudgy brownie with a shiny crinkle top. Dense, chocolatey, and utterly perfect.",
    price: 70,
    image: imgOriginalBrownie,
    tag: "Classic",
    category: "Brownies",
  },
  {
    id: 9,
    name: "Nutella Brownie",
    description: "Fudgy brownie dripping with Nutella and topped with whole roasted hazelnuts.",
    price: 80,
    image: imgNutellaBrownie,
    tag: "Bestseller",
    category: "Brownies",
  },
  // Boxes
  {
    id: 10,
    name: "9 Pieces Box",
    description: "A beautifully packaged Yakamoz gift box with 9 handpicked pieces. Choose your size.",
    price: 300,
    image: imgBox,
    tag: "Gift Box",
    category: "Boxes",
  },
];

const TAG_COLORS: Record<string, string> = {
  Bestseller: "bg-amber-600 text-white",
  "Fan Favorite": "bg-rose-800 text-white",
  New: "bg-emerald-700 text-white",
  Premium: "bg-stone-800 text-white",
  Popular: "bg-orange-700 text-white",
  Classic: "bg-yellow-700 text-white",
  "Serves 4": "bg-purple-800 text-white",
  "Gift Box": "bg-teal-700 text-white",
  VIP: "bg-amber-900 text-amber-300",
};

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";
// Separate template used for the owner's "new order" notification email.
const EMAILJS_OWNER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_OWNER_TEMPLATE_ID || "";
// The owner's email address — passed into the template so the EmailJS
// template's "To email" field can be set to {{owner_email}}.
const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || "";

const CATEGORIES = ["All", "Cookies", "Brownies", "Cakes", "Boxes"] as const;
type Category = (typeof CATEGORIES)[number];

const BOX_SIZES = [
  { label: "Size 1", price: 300 },
  { label: "Size 2", price: 400 },
] as const;

export default function App() {
  const [page, setPage] = useState<Page>("shop");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [boxSizes, setBoxSizes] = useState<Record<number, 1 | 2>>({ 10: 1 });

  // checkout form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"cod" | "instapay">("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 0 ? 50 : 0;
  const total = subtotal + delivery;

  const filtered = activeCategory === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);

  function addToCart(product: Product, boxSize?: 1 | 2) {
    const cartId = product.category === "Boxes" && boxSize ? product.id * 10 + boxSize : product.id;
    const price = product.category === "Boxes" && boxSize ? BOX_SIZES[boxSize - 1].price : product.price;
    const name = product.category === "Boxes" && boxSize ? `${product.name} — ${BOX_SIZES[boxSize - 1].label}` : product.name;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartId);
      if (existing) return prev.map((i) => i.id === cartId ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, id: cartId, name, price, qty: 1, boxSize }];
    });
    setJustAdded(cartId);
    setTimeout(() => setJustAdded(null), 1200);
  }

  function updateQty(id: number, delta: number) {
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0)
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address";
    if (!phone1.trim()) e.phone1 = "Phone number is required";
    else if (!/^[0-9+\-\s]{7,15}$/.test(phone1.trim())) e.phone1 = "Enter a valid phone number";
    if (!address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder() {
    if (!validate()) return;
    setPlacing(true);

    const orderId = `YK-${Date.now().toString().slice(-6)}`;
    const orderLines = cart.map((i) => `• ${i.name} × ${i.qty} — ${i.price * i.qty} EGP`).join("\n");

    const templateParams = {
      order_id: orderId,
      to_name: name,
      to_email: email,
      owner_email: OWNER_EMAIL,
      customer_phone: phone1 + (phone2 ? ` / ${phone2}` : ""),
      customer_address: address,
      payment_method: payment === "cod" ? "Cash on Delivery" : "InstaPay",
      order_items: orderLines,
      order_subtotal: `${subtotal} EGP`,
      order_delivery: `${delivery} EGP`,
      order_total: `${total} EGP`,
    };

    let sent: boolean | null = null;
    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
        sent = true;
      } catch {
        sent = false;
      }
    }

    // Notify the shop owner by email that a new order came in — separate
    // template/email so the owner gets an internal "New Order!" message
    // with the customer's address and items, distinct from the customer's
    // own confirmation email above.
    if (EMAILJS_SERVICE_ID && EMAILJS_OWNER_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_OWNER_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      } catch (err) {
        console.error("Failed to send owner notification email:", err);
      }
    }

    setEmailSent(sent);
    setPlacing(false);
    setPage("confirmation");
  }

  function resetAll() {
    setCart([]);
    setName(""); setEmail(""); setPhone1(""); setPhone2(""); setAddress("");
    setErrors({}); setEmailSent(null);
    setPage("shop");
  }

  // ─── Confirmation ────────────────────────────────────────────────────────
  if (page === "confirmation") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20" style={{ background: "linear-gradient(135deg, #1a0a02 0%, #3d1a08 60%, #5a2e14 100%)" }}>
        <div className="text-center max-w-md w-full">
          <img src={logoImg} alt="Yakamoz logo" className="w-28 h-28 rounded-full object-cover mx-auto mb-6 border-2 border-amber-400/40 shadow-xl" />
          <h1 className="font-display text-5xl font-bold text-amber-300 mb-2">Order Placed!</h1>
          <p className="font-script text-2xl text-amber-200 mb-6">Thank you, {name}!</p>

          {emailSent === true && (
            <div className="bg-emerald-900/40 border border-emerald-500/40 rounded-xl px-4 py-3 mb-6 flex items-center gap-3 text-emerald-300 text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              Confirmation email sent to <span className="font-semibold">{email}</span>
            </div>
          )}
          {emailSent === false && (
            <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-3 text-amber-300 text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              Couldn't send confirmation email — we'll contact you by phone.
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left text-amber-100 space-y-2">
            <p><span className="font-semibold text-white">Payment:</span> {payment === "cod" ? "Cash on Delivery" : "InstaPay"}</p>
            <p><span className="font-semibold text-white">Total:</span> {total} EGP</p>
            <p><span className="font-semibold text-white">Delivering to:</span> {address}</p>
            <p><span className="font-semibold text-white">Phone:</span> {phone1}{phone2 ? ` · ${phone2}` : ""}</p>
            <p><span className="font-semibold text-white">Email:</span> {email}</p>
          </div>
          <p className="text-amber-200/60 text-sm mb-8">We'll confirm your order shortly. Sweet moments are on the way 🌙</p>
          <button onClick={resetAll} className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold py-3 px-10 rounded-full transition-all duration-200 hover:scale-105">
            Shop More
          </button>
        </div>
      </div>
    );
  }

  // ─── Checkout ────────────────────────────────────────────────────────────
  if (page === "checkout") {
    return (
      <div className="min-h-screen" style={{ background: "#FDF6EC" }}>
        <header className="sticky top-0 z-50 bg-stone-900 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setPage("cart")} className="text-amber-300 hover:text-amber-200 flex items-center gap-2 text-sm font-semibold transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M5 12l7 7M5 12l7-7"/></svg>
            Back to Cart
          </button>
          <div className="ml-auto flex items-center gap-2">
            <img src={logoImg} alt="Yakamoz" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-display text-amber-300 font-semibold">Yakamoz</span>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">Checkout</h1>
          <p className="text-stone-500 mb-10">Fill in your details and sweet moments are on the way.</p>

          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <h2 className="font-display text-lg font-semibold text-stone-800 mb-4">Order Summary</h2>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-stone-700">{item.name} <span className="text-stone-400">× {item.qty}</span></span>
                    <span className="font-semibold text-stone-900">{item.price * item.qty} EGP</span>
                  </div>
                ))}
                <div className="border-t border-stone-100 pt-3 space-y-1">
                  <div className="flex justify-between text-sm text-stone-500"><span>Subtotal</span><span>{subtotal} EGP</span></div>
                  <div className="flex justify-between text-sm text-stone-500"><span>Delivery</span><span>{delivery} EGP</span></div>
                  <div className="flex justify-between text-base font-bold text-stone-900 pt-1"><span>Total</span><span className="text-amber-700">{total} EGP</span></div>
                </div>
              </div>
            </div>

            {/* Your Details */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
              <h2 className="font-display text-lg font-semibold text-stone-800">Your Details</h2>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Full Name <span className="text-amber-600">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sara Mohamed"
                  className={`w-full border rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-amber-400 ${errors.name ? "border-red-400 bg-red-50" : "border-stone-200"}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Email Address <span className="text-amber-600">*</span>
                  <span className="ml-2 text-xs font-normal text-stone-400">confirmation sent here</span>
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. sara@example.com"
                  className={`w-full border rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-amber-400 ${errors.email ? "border-red-400 bg-red-50" : "border-stone-200"}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Phone Number <span className="text-amber-600">*</span></label>
                  <input type="tel" value={phone1} onChange={(e) => setPhone1(e.target.value)} placeholder="01x xxxx xxxx"
                    className={`w-full border rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-amber-400 ${errors.phone1 ? "border-red-400 bg-red-50" : "border-stone-200"}`} />
                  {errors.phone1 && <p className="text-red-500 text-xs mt-1">{errors.phone1}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Phone Number 2 <span className="text-stone-400 font-normal">(optional)</span></label>
                  <input type="tel" value={phone2} onChange={(e) => setPhone2(e.target.value)} placeholder="01x xxxx xxxx"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Delivery Address <span className="text-amber-600">*</span></label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, building, floor, apartment, city..." rows={3}
                  className={`w-full border rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 outline-none transition-all focus:ring-2 focus:ring-amber-400 resize-none ${errors.address ? "border-red-400 bg-red-50" : "border-stone-200"}`} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <h2 className="font-display text-lg font-semibold text-stone-800 mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPayment("cod")}
                  className={`flex flex-col items-center gap-2 border-2 rounded-2xl p-5 transition-all duration-200 ${payment === "cod" ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}>
                  <span className="text-3xl">💵</span>
                  <span className={`font-bold text-sm ${payment === "cod" ? "text-amber-700" : "text-stone-700"}`}>Cash on Delivery</span>
                  <span className="text-xs text-stone-400">Pay when you receive</span>
                </button>
                <button onClick={() => setPayment("instapay")}
                  className={`flex flex-col items-center gap-2 border-2 rounded-2xl p-5 transition-all duration-200 ${payment === "instapay" ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}>
                  <span className="text-3xl">📱</span>
                  <span className={`font-bold text-sm ${payment === "instapay" ? "text-amber-700" : "text-stone-700"}`}>InstaPay</span>
                  <span className="text-xs text-stone-400">Pay instantly online</span>
                </button>
              </div>
              {payment === "instapay" && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <p className="font-semibold mb-1">InstaPay Instructions</p>
                  <p>Transfer to: <span className="font-bold">01019943321</span> (Yakamoz)</p>
                  <p className="text-amber-700 mt-1 text-xs">Send a screenshot of your transfer to confirm your order.</p>
                </div>
              )}
            </div>

            <button onClick={placeOrder} disabled={placing}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-600 text-amber-300 font-bold py-4 rounded-2xl text-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg flex items-center justify-center gap-3">
              {placing ? (
                <><svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Placing order…</>
              ) : `Place Order · ${total} EGP`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Cart ─────────────────────────────────────────────────────────────────
  if (page === "cart") {
    return (
      <div className="min-h-screen" style={{ background: "#FDF6EC" }}>
        <header className="sticky top-0 z-50 bg-stone-900 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setPage("shop")} className="text-amber-300 hover:text-amber-200 flex items-center gap-2 text-sm font-semibold transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M5 12l7 7M5 12l7-7"/></svg>
            Continue Shopping
          </button>
          <div className="ml-auto flex items-center gap-2">
            <img src={logoImg} alt="Yakamoz" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-display text-amber-300 font-semibold">Yakamoz</span>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">Your Cart</h1>
          <p className="text-stone-500 mb-10">{totalItems} item{totalItems !== 1 ? "s" : ""} ready to order</p>

          {cart.length === 0 ? (
            <div className="text-center py-24">
              <img src={logoImg} alt="Yakamoz" className="w-20 h-20 rounded-full object-cover mx-auto mb-6 opacity-40" />
              <p className="font-display text-2xl text-stone-600 mb-4">Your cart is empty</p>
              <button onClick={() => setPage("shop")} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-full transition-all">Browse Treats</button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4 border border-stone-100 hover:border-amber-200 transition-colors">
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-amber-50" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-stone-900 text-sm leading-tight mb-1">{item.name}</h3>
                    <p className="text-amber-700 font-bold">{item.price} EGP</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold transition-colors">−</button>
                      <span className="font-bold text-stone-900 w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold transition-colors">+</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="font-bold text-stone-900">{item.price * item.qty} EGP</span>
                    <button onClick={() => updateQty(item.id, -item.qty)} className="text-stone-300 hover:text-red-400 transition-colors text-xs">Remove</button>
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-2xl p-6 border border-stone-100 mt-6 space-y-2">
                <div className="flex justify-between text-sm text-stone-500"><span>Subtotal</span><span>{subtotal} EGP</span></div>
                <div className="flex justify-between text-sm text-stone-500"><span>Delivery fee</span><span>{delivery} EGP</span></div>
                <div className="flex justify-between text-lg font-bold text-stone-900 border-t border-stone-100 pt-3"><span>Total</span><span className="text-amber-700">{total} EGP</span></div>
              </div>

              <button onClick={() => setPage("checkout")}
                className="w-full bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold py-4 rounded-2xl text-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg">
                Proceed to Checkout →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Shop ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#FDF6EC" }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Yakamoz" className="w-10 h-10 rounded-full object-cover border border-amber-400/30" />
          <div>
            <p className="font-display text-amber-300 font-bold leading-tight">YAKAMOZ</p>
            <p className="text-stone-500 text-xs hidden sm:block">Sweets & More</p>
          </div>
        </div>
        <button onClick={() => setPage("cart")}
          className="relative flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-5 rounded-full transition-all duration-200 hover:scale-105">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{totalItems}</span>
          )}
        </button>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a0a02 0%, #3d1a08 60%, #5a2e14 100%)" }}>
      <div className="relative max-w-6xl mx-auto px-6 py-20 max-w-3xl">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={logoImg} alt="Yakamoz logo" className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/40" />
              <div>
                <p className="font-display text-amber-300 font-bold text-lg">YAKAMOZ</p>
                <p className="text-stone-400 text-sm">Sweets & More</p>
              </div>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              Sweet Moments,<br />
              <span className="text-amber-300">Like Moonlight.</span>
            </h1>
            <p className="text-stone-300 text-lg leading-relaxed mb-8 max-w-md">
              Handcrafted cookies, brownies, and gift boxes — baked fresh with love and delivered to your door.
            </p>
            <button
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 hover:scale-105 shadow-xl"
            >
              Order Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,20 C300,0 600,40 900,20 C1050,10 1150,25 1200,20 L1200,40 L0,40 Z" fill="#FDF6EC"/>
          </svg>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-amber-700 text-white">
        <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm font-semibold">
          <span>🌙 Baked fresh daily</span>
          <span>🎁 Beautiful packaging</span>
          <span>💯 100% homemade</span>
        </div>
      </div>

      {/* Products */}
      <section id="products" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="font-script text-xl text-amber-600 mb-2">Our Menu</p>
          <h2 className="font-display text-5xl font-bold text-stone-900">Today's Bakes</h2>
          <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto mt-4" />
        </div>

        {/* Category filter */}
        <div className="flex justify-center gap-2 flex-wrap mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-stone-900 text-amber-300"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-amber-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => {
            const isBox = product.category === "Boxes";
            const selectedSize = isBox ? (boxSizes[product.id] ?? 1) : undefined;
            const cartId = isBox && selectedSize ? product.id * 10 + selectedSize : product.id;
            const inCart = cart.find((i) => i.id === cartId);
            const totalInCart = isBox ? cart.filter((i) => i.id === product.id * 10 + 1 || i.id === product.id * 10 + 2).reduce((s, i) => s + i.qty, 0) : 0;
            const added = justAdded === cartId;
            const displayPrice = isBox && selectedSize ? BOX_SIZES[selectedSize - 1].price : product.price;

            return (
              <div key={product.id} className="group bg-white rounded-3xl overflow-hidden border border-stone-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="relative overflow-hidden bg-amber-50">
                  <img src={product.image} alt={product.name} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${TAG_COLORS[product.tag] || "bg-stone-700 text-white"}`}>
                    {product.tag}
                  </span>
                  {(isBox ? totalInCart > 0 : inCart) && (
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {isBox ? totalInCart : inCart!.qty} in cart
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">{product.category}</span>
                  <h3 className="font-display font-semibold text-stone-900 text-base leading-tight mb-2">{product.name}</h3>
                  <p className="text-stone-500 text-xs leading-relaxed flex-1 mb-3">{product.description}</p>

                  {isBox && (
                    <div className="flex gap-2 mb-4">
                      {BOX_SIZES.map((s, idx) => (
                        <button
                          key={s.label}
                          onClick={() => setBoxSizes((prev) => ({ ...prev, [product.id]: (idx + 1) as 1 | 2 }))}
                          className={`flex-1 text-xs font-bold py-2 px-2 rounded-xl border-2 transition-all duration-150 ${
                            selectedSize === idx + 1
                              ? "border-amber-500 bg-amber-50 text-amber-800"
                              : "border-stone-200 text-stone-500 hover:border-amber-300"
                          }`}
                        >
                          {s.label}<br />
                          <span className="font-normal">{s.price} EGP</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xl text-amber-700">{displayPrice} <span className="text-sm font-normal text-stone-500">EGP</span></span>
                    <button
                      onClick={() => addToCart(product, isBox ? selectedSize : undefined)}
                      className={`flex items-center gap-1.5 font-bold text-sm py-2 px-4 rounded-full transition-all duration-200 ${
                        added
                          ? "bg-emerald-600 text-white scale-95"
                          : "bg-stone-900 hover:bg-amber-600 text-amber-300 hover:text-white hover:scale-105"
                      }`}
                    >
                      {added ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>Added!</>
                      ) : (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>Add</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button onClick={() => setPage("cart")}
            className="flex items-center gap-4 bg-stone-900 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:bg-stone-800 transition-all duration-200 hover:scale-105">
            <span className="bg-amber-500 text-stone-900 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center">{totalItems}</span>
            View Cart
            <span className="text-amber-300">{subtotal} EGP</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-6 text-center">
        <img src={logoImg} alt="Yakamoz" className="w-14 h-14 rounded-full object-cover mx-auto mb-3 opacity-80" />
        <p className="font-display text-amber-300 font-bold text-lg">YAKAMOZ</p>
        <p className="text-sm mt-1">Sweets & More — Sweet Moments, Like Moonlight</p>
        <p className="text-xs mt-4 text-stone-600">© 2026 Yakamoz. All rights reserved.</p>
      </footer>
    </div>
  );
}
