class ApiResponse {
    constructor(statuscode, message, data="success"){
        this.statuscode=statuscode
        this.data=data
        this.message=message
        this.success=statuscode <400
    }
}

export {ApiResponse}