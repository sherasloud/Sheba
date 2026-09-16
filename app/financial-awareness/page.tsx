"use client"

import { ArrowLeft, ShieldAlert, TrendingUp, AlertCircle, Lightbulb, Heart } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FinancialAwarenessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-6 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="text-sm">ফিরে যান</span>
          </button>
          <h1 className="text-2xl font-bold mb-2">আপনার কষ্টের টাকা</h1>
          <p className="text-white/90 text-sm">অপ্রয়োজনে উপার্জিত টাকা নষ্ট করবেন না</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-red-100">
            <div className="flex items-start space-x-4">
              <div className="bg-red-500 p-3 rounded-full">
                <ShieldAlert className="text-white" size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">আপনার টাকার মূল্য বুঝুন</h2>
                <p className="text-gray-700 leading-relaxed">
                  প্রতিটি টাকা আপনার কষ্ট, ঘাম এবং সময়ের বিনিময়ে অর্জিত। এই কঠোর পরিশ্রমের মূল্য দিন এবং অপ্রয়োজনীয় খরচ থেকে বিরত
                  থাকুন।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Money Matters */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="text-red-500" size={24} />
            <h3 className="text-lg font-bold text-gray-900">টাকার মূল্য কেন গুরুত্বপূর্ণ?</h3>
          </div>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold text-gray-800 mb-1">১. পরিবারের নিরাপত্তা</p>
              <p className="text-sm text-gray-600">
                আপনার সঞ্চিত টাকা পরিবারের জরুরি প্রয়োজনে, চিকিৎসা খরচে এবং শিক্ষায় সাহায্য করবে।
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-semibold text-gray-800 mb-1">২. ভবিষ্যৎ পরিকল্পনা</p>
              <p className="text-sm text-gray-600">
                বাড়ি কেনা, ব্যবসা শুরু করা, বা ভবিষ্যতের স্বপ্ন পূরণের জন্য আজকের সঞ্চয় অপরিহার্য।
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="font-semibold text-gray-800 mb-1">৩. আর্থিক স্বাধীনতা</p>
              <p className="text-sm text-gray-600">
                সঠিক সঞ্চয় এবং বিনিয়োগ আপনাকে আর্থিকভাবে স্বাধীন করবে এবং জীবনে শান্তি আনবে।
              </p>
            </div>
          </div>
        </div>

        {/* Common Money Mistakes */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-md p-6 border border-red-100">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="text-red-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900">এড়িয়ে চলুন এই ভুলগুলো</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-red-700 mb-1">❌ অপ্রয়োজনীয় কেনাকাটা</p>
              <p className="text-sm text-gray-600">
                ফ্যাশন, লাক্সারি আইটেম বা দেখানোর জন্য খরচ করা থেকে বিরত থাকুন। প্রয়োজন আর ইচ্ছার মধ্যে পার্থক্য বুঝুন।
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-red-700 mb-1">❌ ঋণের জালে জড়ানো</p>
              <p className="text-sm text-gray-600">
                ক্রেডিট কার্ড বা ব্যক্তিগত ঋণের উচ্চ সুদ আপনার আর্থিক স্বাধীনতা কেড়ে নেয়। যতটা সম্ভব নগদ লেনদেন করুন।
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-red-700 mb-1">❌ সঞ্চয় না করা</p>
              <p className="text-sm text-gray-600">
                মাসিক আয়ের অন্তত ১৫-২০% সঞ্চয় করুন। "বাকি টাকা সঞ্চয় করব" নয়, "প্রথমে সঞ্চয়, তারপর খরচ" নীতি মানুন।
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-red-700 mb-1">❌ আবেগে খরচ করা</p>
              <p className="text-sm text-gray-600">
                মন খারাপ বা আনন্দে আবেগতাড়িত হয়ে কেনাকাটা করবেন না। প্রতিটি খরচের আগে ২৪ ঘণ্টা চিন্তা করুন।
              </p>
            </div>
          </div>
        </div>

        {/* Smart Money Tips */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="text-yellow-500" size={24} />
            <h3 className="text-lg font-bold text-gray-900">স্মার্ট টাকা ব্যবস্থাপনা</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2 mt-1">
                <TrendingUp className="text-green-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">৫০/৩০/২০ নিয়ম অনুসরণ করুন</p>
                <p className="text-sm text-gray-600">
                  আয়ের ৫০% প্রয়োজনীয় খরচ, ৩০% ইচ্ছা পূরণ, এবং ২০% সঞ্চয় ও বিনিয়োগে রাখুন।
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <TrendingUp className="text-blue-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">জরুরি তহবিল তৈরি করুন</p>
                <p className="text-sm text-gray-600">
                  ৩-৬ মাসের খরচের সমান একটি জরুরি তহবিল রাখুন যা শুধু জরুরি প্রয়োজনে ব্যবহার করবেন।
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 rounded-full p-2 mt-1">
                <TrendingUp className="text-purple-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">বাজেট তৈরি করুন</p>
                <p className="text-sm text-gray-600">
                  প্রতি মাসের শুরুতে খরচের বাজেট তৈরি করুন এবং সেবা অ্যাপের "Budget" ফিচার ব্যবহার করে ট্র্যাক করুন।
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-orange-100 rounded-full p-2 mt-1">
                <TrendingUp className="text-orange-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">বিনিয়োগে মনোযোগী হন</p>
                <p className="text-sm text-gray-600">
                  সঞ্চয় হিসাব, সেভিংস বন্ড বা সুদমুক্ত বিনিয়োগে টাকা রাখুন যা মূল্যস্ফীতির বিরুদ্ধে আপনার সম্পদ রক্ষা করবে।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="text-center space-y-3">
            <p className="text-lg font-semibold italic">"অর্থ সুখ কিনতে পারে না, কিন্তু সঠিক ব্যবস্থাপনা আপনাকে শান্তি দিতে পারে।"</p>
            <p className="text-sm opacity-90">আপনার কষ্টে উপার্জিত প্রতিটি টাকাকে সম্মান করুন এবং বুদ্ধিমানের সাথে ব্যবহার করুন।</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">আজই শুরু করুন</h3>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/monthly-budget")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              বাজেট তৈরি করুন
            </button>
            <button
              onClick={() => router.push("/savings")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              সঞ্চয় শুরু করুন
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-colors"
            >
              হোম পেজে ফিরে যান
            </button>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">সেবা আপনার আর্থিক নিরাপত্তায় বিশ্বাস করে। সঠিক সিদ্ধান্ত নিন, সুন্দর ভবিষ্যৎ গড়ুন।</p>
        </div>
      </div>
    </div>
  )
}
