"use client";

import { useState } from "react";
import { update } from "@/lib/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

const SLIDES = [
  {
    title: "不是你太懶",
    body: "是你的大腦真的太累了。\n\n焦慮、失眠、疲憊、注意力渙散，常常不是意志力問題，而是大腦長期過載的訊號。",
  },
  {
    title: "SHIFT 五個方向",
    body: "睡眠 · 激素 · 發炎 · 食物 · 科技使用。\n\n這 App 幫你看見自己累在哪一塊，再用微習慣慢慢修復。",
  },
  {
    title: "每天 30 秒就好",
    body: "不用背負巨大的健康計畫。\n\n打卡 30 秒、Brain Pause 1–3 分鐘、每週看一次模式。慢慢來，比較快。",
  },
];

function WelcomeInner() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");

  const finish = () => {
    update((d) => {
      d.settings.name = name.trim() || undefined;
    });
    router.push("/assessment");
  };

  if (step < SLIDES.length) {
    const s = SLIDES[step];
    return (
      <div className="min-h-[60vh] flex flex-col justify-between animate-fade-in pt-8">
        <div>
          <div className="text-xs text-ink-500 mb-2">
            {step + 1} / {SLIDES.length + 1}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{s.title}</h1>
          <p className="text-base text-ink-600 dark:text-ink-300 mt-4 whitespace-pre-line leading-relaxed">
            {s.body}
          </p>
        </div>
        <div className="flex items-center justify-between pt-8">
          <Link href="/" className="text-xs text-ink-500">
            跳過
          </Link>
          <button onClick={() => setStep(step + 1)} className="btn-primary">
            繼續 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col justify-between animate-fade-in pt-8">
      <div>
        <div className="text-xs text-ink-500 mb-2">最後一步</div>
        <h1 className="text-3xl font-semibold tracking-tight">怎麼稱呼你？</h1>
        <p className="text-sm text-ink-500 mt-2">選填，只會用在 App 內部問候，不會傳出去。</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：阿樹"
          className="input mt-4 text-lg"
          maxLength={20}
        />
      </div>
      <div className="flex items-center justify-between pt-8">
        <button onClick={() => setStep(step - 1)} className="text-xs text-ink-500">
          上一步
        </button>
        <button onClick={finish} className="btn-primary">
          開始檢測 <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <WelcomeInner />
    </ClientOnly>
  );
}
