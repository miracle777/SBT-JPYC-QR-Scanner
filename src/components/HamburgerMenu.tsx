'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Award, BookOpen, ShoppingBag, Github, HelpCircle } from 'lucide-react';

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* ハンバーガーメニューボタン */}
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors z-50"
        aria-label="メニュー"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        ></div>
      )}

      {/* メニューパネル */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">メニュー</h2>
            <button
              onClick={closeMenu}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* メニューアイテム */}
          <nav className="flex-1 overflow-y-auto py-4">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">ホーム</span>
            </Link>

            <Link
              href="/sbt-gallery"
              onClick={closeMenu}
              className="flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Award className="w-5 h-5" />
              <span className="font-medium">SBTコレクション</span>
            </Link>

            <Link
              href="/address-book"
              onClick={closeMenu}
              className="flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">アドレス帳</span>
            </Link>

            <a
              href="https://github.com/miracle777/SBT-JPYC-QR-Scanner/wiki/FAQ"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <div className="flex-1">
                <div className="font-medium">FAQ・よくある質問</div>
                <div className="text-xs text-gray-500">トラブルシューティング・使い方</div>
              </div>
            </a>

            <div className="border-t border-gray-200 my-4"></div>

            <a
              href="https://shop.jpyc-pay.app/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <div className="flex-1">
                <div className="font-medium">店舗管理システム</div>
                <div className="text-xs text-gray-500">決済QRコード生成・SBT発行</div>
              </div>
            </a>

            <a
              href="https://github.com/miracle777/SBT-JPYC-QR-Scanner"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="font-medium">GitHubリポジトリ</span>
            </a>
          </nav>

          {/* フッター */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              <p>&copy; 2025 SBT masaru21 QR Scanner</p>
              <p className="mt-1">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
