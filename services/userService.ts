import api from "@/services/axiosInstance";

export async function fetchNearbySellers(lat?: number, lng?: number) {
    try {
        const params: any = {};

        if (lat && lng) {
            params.lat = lat;
            params.lng = lng;
        }

        const response = await api.get("/getNearbySellers", { params });

        return response.data;
    } catch (error: any) {
        console.log("getNearbySellers error:", error?.response?.data || error);
        throw error;
    }
}
