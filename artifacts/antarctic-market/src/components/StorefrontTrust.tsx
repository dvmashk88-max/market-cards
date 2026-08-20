import React, { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import {
  fetchStorefrontReviews,
  fetchStorefrontStats,
  publishStorefrontReview,
  registerStorefrontVisit,
  type StorefrontReview,
  type StorefrontStats,
} from "@/lib/storefrontTrust";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} из 5`}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export type StorefrontTrustViewProps = {
  sectionRef?: RefObject<HTMLElement | null>;
  stats: StorefrontStats | null;
  reviews: StorefrontReview[];
  loading: boolean;
  unavailable: boolean;
  formOpen: boolean;
  submitting: boolean;
  submitError: string;
  submitted: boolean;
  name: string;
  rating: number;
  text: string;
  website: string;
  onOpenForm: () => void;
  onName: (value: string) => void;
  onRating: (value: number) => void;
  onText: (value: string) => void;
  onWebsite: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function StorefrontTrustView(props: StorefrontTrustViewProps) {
  const ratingLabel =
    props.stats?.averageRating === null
      ? "Нет оценок"
      : props.stats
        ? `${props.stats.averageRating.toFixed(1)} ★`
        : "—";

  return (
    <section
      ref={props.sectionRef}
      id="trust"
      aria-labelledby="storefront-trust-title"
      className="px-4 py-10"
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
        <div className="h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500" />
        <div className="p-5 sm:p-7 lg:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/65">
            Доверие покупателей
          </p>
          <h2
            id="storefront-trust-title"
            className="mt-2 text-2xl font-black text-white md:text-3xl"
          >
            MarketCode в цифрах
          </h2>

          <div
            className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4"
            aria-busy={props.loading}
          >
            {[
              [
                props.stats ? formatNumber(props.stats.visits) : "—",
                "Посещений сайта",
              ],
              [
                props.stats
                  ? formatNumber(props.stats.successfulPurchases)
                  : "—",
                "Успешных покупок",
              ],
              [ratingLabel, "Средняя оценка"],
              [
                props.stats ? formatNumber(props.stats.reviewsCount) : "—",
                "Отзывов",
              ],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs text-white/45">{label}</p>
              </div>
            ))}
          </div>

          {props.unavailable && (
            <p className="mt-4 text-sm text-white/45" role="status">
              Статистика временно недоступна. Магазин продолжает работать в
              обычном режиме.
            </p>
          )}

          <div className="mt-7">
            <h3 className="text-xl font-bold text-white">Последние отзывы</h3>
            {props.loading && props.reviews.length === 0 ? (
              <p className="mt-4 text-sm text-white/45">Загружаем отзывы…</p>
            ) : props.reviews.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/50">
                Отзывов пока нет. Вы можете оставить первый честный отзыв.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {props.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-white">{review.name}</p>
                      <span className="whitespace-nowrap text-sm text-amber-300">
                        <Stars rating={review.rating} />
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-white/65">
                      {review.text}
                    </p>
                    <time
                      className="mt-4 block text-xs text-white/30"
                      dateTime={review.createdAt}
                    >
                      {new Date(review.createdAt).toLocaleDateString("ru-RU")}
                    </time>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            {!props.formOpen ? (
              <button
                type="button"
                onClick={props.onOpenForm}
                className="rounded-xl border border-purple-400/40 bg-purple-500/15 px-5 py-3 text-sm font-bold text-purple-100 transition hover:bg-purple-500/25"
              >
                Оставить отзыв
              </button>
            ) : (
              <form
                onSubmit={props.onSubmit}
                className="max-w-2xl space-y-4"
                noValidate
              >
                <h3 className="text-xl font-bold text-white">Оставить отзыв</h3>
                <div>
                  <label
                    htmlFor="review-name"
                    className="mb-1.5 block text-xs font-semibold text-white/55"
                  >
                    Имя или ник
                  </label>
                  <input
                    id="review-name"
                    value={props.name}
                    onChange={(event) => props.onName(event.target.value)}
                    minLength={2}
                    maxLength={50}
                    required
                    autoComplete="nickname"
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-purple-400/50"
                  />
                </div>
                <fieldset>
                  <legend className="mb-1.5 text-xs font-semibold text-white/55">
                    Оценка
                  </legend>
                  <div className="flex gap-1" aria-label="Оценка от 1 до 5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} из 5`}
                        aria-pressed={props.rating === value}
                        onClick={() => props.onRating(value)}
                        className={`p-1 text-2xl ${value <= props.rating ? "text-amber-300" : "text-white/20"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label
                    htmlFor="review-text"
                    className="mb-1.5 block text-xs font-semibold text-white/55"
                  >
                    Текст отзыва
                  </label>
                  <textarea
                    id="review-text"
                    value={props.text}
                    onChange={(event) => props.onText(event.target.value)}
                    minLength={5}
                    maxLength={500}
                    required
                    rows={4}
                    className="w-full resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-purple-400/50"
                  />
                  <p className="mt-1 text-right text-xs text-white/30">
                    {props.text.length}/500
                  </p>
                </div>
                <div
                  className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="review-website">Ваш сайт</label>
                  <input
                    id="review-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={props.website}
                    onChange={(event) => props.onWebsite(event.target.value)}
                  />
                </div>
                {props.submitError && (
                  <p className="text-sm text-rose-300" role="alert">
                    {props.submitError}
                  </p>
                )}
                {props.submitted && (
                  <p className="text-sm text-emerald-300" role="status">
                    Спасибо! Отзыв опубликован.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={props.submitting}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {props.submitting ? "Публикуем…" : "Опубликовать отзыв"}
                </button>
                <p className="text-xs leading-5 text-white/35">
                  Отзыв публикуется автоматически. Не указывайте персональные
                  данные и данные заказа.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StorefrontTrust() {
  const sectionRef = useRef<HTMLElement>(null);
  const [stats, setStats] = useState<StorefrontStats | null>(null);
  const [reviews, setReviews] = useState<StorefrontReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formStartedAt, setFormStartedAt] = useState(0);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function load(signal?: AbortSignal) {
    void registerStorefrontVisit(signal).catch(() => undefined);
    const [statsResult, reviewsResult] = await Promise.allSettled([
      fetchStorefrontStats(signal),
      fetchStorefrontReviews(3, signal),
    ]);
    if (signal?.aborted) return;
    if (statsResult.status === "fulfilled") setStats(statsResult.value);
    if (reviewsResult.status === "fulfilled") setReviews(reviewsResult.value);
    setUnavailable(
      statsResult.status === "rejected" || reviewsResult.status === "rejected",
    );
  }

  useEffect(() => {
    const controller = new AbortController();
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      void load(controller.signal).finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    };
    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              start();
              observer?.disconnect();
            }
          },
          { rootMargin: "320px 0px" },
        );
    if (sectionRef.current) observer?.observe(sectionRef.current);
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const idleHandle = idleWindow.requestIdleCallback?.(start, { timeout: 2_500 });
    const fallbackHandle = idleHandle === undefined
      ? window.setTimeout(start, 1_500)
      : undefined;

    return () => {
      controller.abort();
      observer?.disconnect();
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (fallbackHandle !== undefined) window.clearTimeout(fallbackHandle);
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError("");
    setSubmitted(false);
    try {
      const review = await publishStorefrontReview({
        name,
        rating,
        text,
        website,
        formStartedAt,
      });
      setReviews((current) =>
        [review, ...current.filter((item) => item.id !== review.id)].slice(
          0,
          3,
        ),
      );
      setStats((current) =>
        current
          ? {
              ...current,
              reviewsCount: current.reviewsCount + 1,
              averageRating:
                current.averageRating === null
                  ? review.rating
                  : Math.round(
                      ((current.averageRating * current.reviewsCount +
                        review.rating) /
                        (current.reviewsCount + 1)) *
                        10,
                    ) / 10,
            }
          : current,
      );
      setName("");
      setRating(5);
      setText("");
      setWebsite("");
      setSubmitted(true);
      const refreshed = await fetchStorefrontStats().catch(() => null);
      if (refreshed) setStats(refreshed);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось опубликовать отзыв",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StorefrontTrustView
      sectionRef={sectionRef}
      stats={stats}
      reviews={reviews}
      loading={loading}
      unavailable={unavailable}
      formOpen={formOpen}
      submitting={submitting}
      submitError={submitError}
      submitted={submitted}
      name={name}
      rating={rating}
      text={text}
      website={website}
      onOpenForm={() => {
        setFormOpen(true);
        setFormStartedAt(Date.now());
      }}
      onName={setName}
      onRating={setRating}
      onText={setText}
      onWebsite={setWebsite}
      onSubmit={(event) => void submit(event)}
    />
  );
}
