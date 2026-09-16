export const maxDuration = 30

interface Message {
  role: string
  content: string
}

const RESPONSES: Record<string, string> = {
  // Greetings
  hello:
    "আসসালামু আলাইকুম! আমি সেবা লাইভ। আপনাকে কিভাবে সাহায্য করতে পারি?\n\nসেবা অ্যাপের সব ফিচার সম্পর্কে আমি আপনাকে বলতে পারি। রিচার্জ, সেন্ড মানি, ক্যাশআউট, বিল পেমেন্ট - যা দরকার সব!",
  hi: "হ্যালো! আমি সেবা লাইভ। আপনার কি সাহায্য লাগবে?\n\nরিচার্জ করতে চান? মানি ট্রান্সফার করতে চান? নাকি অন্য কিছু জানতে চান?",

  // Recharge
  recharge:
    "মোবাইল রিচার্জ করার জন্য:\n\n১. হোম স্ক্রিনে 'রিচার্জ' এ ক্লিক করুন\n২. ফোন নম্বর দিন (যেই নম্বরে রিচার্জ করবেন)\n৩. পরিমাণ সিলেক্ট করুন\n৪. অপারেটর অটোমেটিক ডিটেক্ট হবে (জিপি, রবি, বাংলালিংক, এয়ারটেল, টেলিটক)\n৫. পিন দিয়ে কনফার্ম করুন\n৬. রিচার্জ ইনস্ট্যান্টলি হয়ে যাবে!\n\nদৈনিক সীমা: ৫০০০ টাকা\nসব অপারেটর সাপোর্টেড!",

  // Send Money
  "send money":
    "টাকা পাঠাতে:\n\n১. 'সেন্ড মানি' তে যান\n২. প্রাপকের ফোন নম্বর দিন\n৩. পরিমাণ লিখুন\n৪. ৬-ডিজিটের পিন দিয়ে কনফার্ম করুন\n৫. ইনস্ট্যান্টলি টাকা ট্রান্সফার হবে!\n\nনিরাপদ এবং সুরক্ষিত। কোনো চার্জ নেই সেবা ইউজারদের মধ্যে!",

  // Cashout
  cashout:
    "ক্যাশ আউট করার প্রক্রিয়া:\n\n১. 'ক্যাশআউট' অপশনে যান\n২. এজেন্টের নম্বর দিন\n৩. পরিমাণ লিখুন\n৪. পিন দিয়ে কনফার্ম করুন\n৫. এজেন্টের কাছ থেকে ক্যাশ নিন\n\nএজেন্ট ফি প্রযোজ্য হবে। নিকটতম এজেন্ট খুঁজে নিন!",

  // Add Money
  "add money":
    "ব্যালেন্স যোগ করার জন্য:\n\n১. 'অ্যাড মানি' তে ক্লিক করুন\n২. কার্ড বা ব্যাংক অপশন সিলেক্ট করুন\n৩. পরিমাণ দিন (সর্বোচ্চ ২০,০০০ টাকা)\n৪. কার্ডের বিবরণ দিন\n৫. পেমেন্ট কনফার্ম করুন\n৬. ইনস্ট্যান্টলি ব্যালেন্স ক্রেডিট হবে!\n\nনিরাপদ এবং সুরক্ষিত পেমেন্ট গেটওয়ে!",

  // Balance
  balance:
    "ব্যালেন্স দেখতে:\n\nহোম স্ক্রিনে উপরে 'সেবা' টেক্সটে ক্লিক করুন। ব্যালেন্স দেখাবে/লুকাবে!\n\nব্যালেন্স লুকিয়ে রাখতে পারেন গোপনীয়তার জন্য। আবার ক্লিক করলে দেখাবে।",

  // Transaction History
  history:
    "লেনদেনের ইতিহাস দেখতে:\n\n১. নিচে 'ইনবক্স' আইকনে ক্লিক করুন\n২. সব লেনদেন দেখতে পারবেন\n৩. বিস্তারিত জানতে যেকোনো লেনদেনে ক্লিক করুন\n\nসব পাঠানো, গ্রহণ, রিচার্জ, পেমেন্ট - সব কিছু ট্র্যাক করতে পারবেন!",

  // PIN
  pin: "পিন সম্পর্কে:\n\n- ৬-ডিজিটের নিরাপত্তা পিন দরকার সব লেনদেনের জন্য\n- পিন গোপন রাখুন, কারো সাথে শেয়ার করবেন না\n- পিন ভুলে গেলে 'ফরগট পিন' অপশন ব্যবহার করুন\n- পিন পরিবর্তন করতে সেটিংসে যান\n\nনিরাপত্তার জন্য পিন খুবই গুরুত্বপূর্ণ!",

  // Bill Payment
  bill: "বিল পেমেন্ট করার জন্য:\n\n১. 'বিল' অপশনে যান\n২. বিলের ধরন সিলেক্ট করুন (বিদ্যুৎ, গ্যাস, পানি, ইন্টারনেট)\n৩. অ্যাকাউন্ট নম্বর দিন\n৪. পরিমাণ চেক করুন\n৫. পিন দিয়ে পে করুন\n\nসব ইউটিলিটি বিল সহজেই পরিশোধ করতে পারেন!",

  // Help
  help: "আমি আপনাকে সাহায্য করতে পারি:\n\n✓ রিচার্জ - সব অপারেটরে মোবাইল রিচার্জ\n✓ সেন্ড মানি - ইনস্ট্যান্ট টাকা ট্রান্সফার\n✓ ক্যাশআউট - এজেন্ট থেকে ক্যাশ উত্তোলন\n✓ অ্যাড মানি - কার্ড/ব্যাংক দিয়ে ব্যালেন্স যোগ\n✓ বিল পেমেন্ট - ইউটিলিটি বিল\n✓ শিক্ষা ফি - শিক্ষা পেমেন্ট\n✓ এয়ার/রেল টিকিট - ভ্রমণ বুকিং\n✓ সঞ্চয় - সঞ্চয় অ্যাকাউন্ট\n✓ আরও অনেক কিছু!\n\nকি জানতে চান? নির্দিষ্ট প্রশ্ন করুন!",

  // Default
  default:
    "আপনার প্রশ্নটা আমি ঠিক বুঝতে পারলাম না। আরেকটু পরিষ্কার করে বলবেন?\n\nআমি সাহায্য করতে পারি:\n- রিচার্জ কিভাবে করবো?\n- টাকা কিভাবে পাঠাবো?\n- ব্যালেন্স কিভাবে দেখবো?\n- লেনদেনের ইতিহাস কোথায়?\n- পিন ভুলে গেলে কি করবো?\n\nকি জানতে চান?",
}

function getResponse(userMessage: string): string {
  const message = userMessage.toLowerCase().trim()

  // Check for greetings
  if (
    message.includes("hello") ||
    message.includes("hi") ||
    message.includes("hey") ||
    message.includes("assalam") ||
    message.includes("salam")
  ) {
    return RESPONSES.hello
  }

  // Check for recharge
  if (
    message.includes("recharge") ||
    message.includes("রিচার্জ") ||
    message.includes("load") ||
    message.includes("flexiload")
  ) {
    return RESPONSES.recharge
  }

  // Check for send money
  if (
    message.includes("send") ||
    message.includes("transfer") ||
    message.includes("pathabo") ||
    message.includes("টাকা পাঠা")
  ) {
    return RESPONSES["send money"]
  }

  // Check for cashout
  if (
    message.includes("cashout") ||
    message.includes("cash out") ||
    message.includes("withdraw") ||
    message.includes("তুলতে")
  ) {
    return RESPONSES.cashout
  }

  // Check for add money
  if (
    message.includes("add money") ||
    message.includes("add balance") ||
    message.includes("টাকা যোগ") ||
    message.includes("balance add")
  ) {
    return RESPONSES["add money"]
  }

  // Check for balance
  if (
    message.includes("balance") ||
    message.includes("ব্যালেন্স") ||
    message.includes("টাকা আছে") ||
    message.includes("কত টাকা")
  ) {
    return RESPONSES.balance
  }

  // Check for history
  if (
    message.includes("history") ||
    message.includes("transaction") ||
    message.includes("হিস্ট্রি") ||
    message.includes("লেনদেন")
  ) {
    return RESPONSES.history
  }

  // Check for PIN
  if (
    message.includes("pin") ||
    message.includes("পিন") ||
    message.includes("password") ||
    message.includes("পাসওয়ার্ড")
  ) {
    return RESPONSES.pin
  }

  // Check for bill
  if (
    message.includes("bill") ||
    message.includes("বিল") ||
    message.includes("electricity") ||
    message.includes("gas")
  ) {
    return RESPONSES.bill
  }

  // Check for help
  if (
    message.includes("help") ||
    message.includes("সাহায্য") ||
    message.includes("কি করতে পারি") ||
    message.includes("features")
  ) {
    return RESPONSES.help
  }

  // Default response
  return RESPONSES.default
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json()

    console.log("[v0] Sheba Live API called with", messages.length, "messages")

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== "user") {
      throw new Error("No user message found")
    }

    // Get response based on user message
    const response = getResponse(lastMessage.content)

    console.log("[v0] Sending response:", response.substring(0, 50) + "...")

    // Return simple JSON response instead of streaming
    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Sheba Live API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
