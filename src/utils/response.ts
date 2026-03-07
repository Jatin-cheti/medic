export const successResponse = (res: any, data: any) => {
    return res.status(200).json({ success: true, data });
};

export const errorResponse = (res: any, message: string) => {
    return res.status(400).json({ success: false, message });
};
