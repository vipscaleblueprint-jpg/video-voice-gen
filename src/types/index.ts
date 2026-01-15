export interface CaptionData {
    content: string;
    hashtags: string;
    title: string;
    caption?: string;
}

export interface SocialCaptions {
    [key: string]: CaptionData;
}
