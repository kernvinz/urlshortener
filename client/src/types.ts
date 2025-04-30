export type UrlPayload = {
    finalUrl: string;
    expirationDate?: string; 
};

export type CheckboxItem = {
  id: number;
  label: string;
};

export type CheckedState = {
  [key: number]: boolean;
};

export type AdditionalInfoState = {
  [key: number]: string;
};