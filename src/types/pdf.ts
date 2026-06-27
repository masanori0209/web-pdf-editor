// PDF関連の型定義
export interface PdfInfo {
  page_count: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creation_date?: string;
  modification_date?: string;
}

export interface TextAnnotation {
  page: number;
  x: number;
  y: number;
  text: string;
  font_size: number;
  color: string;
  font_family: string;
}

export interface TextInsertion {
  page: number;
  x: number;
  y: number;
  text: string;
  font_size: number;
  color: string;
  font_family: string;
}

export type ViewMode = 'view' | 'edit';
export type EditTool =
  | 'select'
  | 'annotation'
  | 'text'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'callout'
  | 'slash';

export type EditObjectKind =
  | 'text'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'callout'
  | 'slash';

export interface EditObject {
  id: string;
  page: number;
  kind: EditObjectKind;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  font_size: number;
  color: string;
  font_family: string;
  bold: boolean;
  italic: boolean;
  strike_through: boolean;
  stroke_color: string;
  fill_color: string;
  fill_enabled: boolean;
  stroke_width: number;
}

export interface PendingEdit {
  x: number;
  y: number;
  page: number;
}
