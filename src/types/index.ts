export interface CaptionData {
    content: string;
    hashtags: string;
    title: string;
}

export interface SocialCaptions {
    [key: string]: CaptionData;
}
