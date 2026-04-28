import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <main className="w-full max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Đồ án tốt nghiệp
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Học ngoại ngữ theo lộ trình
        </h1>
        <p className="mt-3 text-pretty text-zinc-600 dark:text-zinc-400">
          Đăng ký hoặc đăng nhập để bắt đầu lưu bộ từ và tiến độ học. Giao diện sẽ
          được hoàn thiện sau khi các chức năng lõi ổn định.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/topics"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Chủ đề từ vựng
          </Link>
          <Link
            href="/lessons"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Bài học
          </Link>
          <Link
            href="/decks"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Bộ từ của tôi
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Tạo tài khoản
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Đăng nhập
          </Link>
        </div>
      </main>
    </div>
  );
}
