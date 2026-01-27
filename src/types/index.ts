export interface CaptionData {
    content: string;
    hashtags: string;
    title: string;
    caption?: string;
}

export interface SocialCaptions {
    title?: string;
    [key: string]: CaptionData | string | undefined;
}
