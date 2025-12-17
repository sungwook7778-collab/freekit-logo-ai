export enum CuisineType {
  KOREAN = '한식',
  CHINESE = '중식',
  JAPANESE = '일식',
  WESTERN = '양식',
  CAFE = '카페/디저트',
  PUB = '주점/포차',
  FASTFOOD = '패스트푸드',
  CHICKEN = '치킨/피자',
  OTHER = '기타'
}

export interface LogoFormData {
  businessName: string;
  cuisine: CuisineType;
  additionalDetails: string;
}

export interface GeneratedLogo {
  imageUrl: string;
  promptUsed: string;
  createdAt: number;
}
