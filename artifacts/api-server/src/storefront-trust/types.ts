export type StorefrontStats = {
  visits: number;
  successfulPurchases: number;
  averageRating: number | null;
  reviewsCount: number;
};

export type PublicReview = {
  id: string;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type VisitRecord = {
  id: number;
  createdAt: Date;
};

export type StoredReview = Omit<PublicReview, "createdAt"> & {
  createdAt: Date;
};

export interface StorefrontTrustRepository {
  findVisitByTokenHash(tokenHash: string): Promise<VisitRecord | null>;
  createVisit(tokenHash: string): Promise<VisitRecord>;
  getStats(): Promise<StorefrontStats>;
  getLatestReviews(limit: number): Promise<StoredReview[]>;
  createReview(input: {
    visitId: number;
    name: string;
    rating: number;
    text: string;
  }): Promise<StoredReview>;
}
