import { useState, useCallback } from "react";

export const useLoading = () => {
    const [loading, isLoading] = useState(false)
    const [error, isError]= useState<Error | null>(null) 

    const execute = isLoading(false)


}