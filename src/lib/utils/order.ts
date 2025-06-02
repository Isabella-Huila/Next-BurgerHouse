import { OrderState } from "../types/order.types"

  export const getOrderStateColor = (state: OrderState) => {
    switch (state) {
      case OrderState.Pending:
        return 'bg-yellow-100 text-yellow-800'
      case OrderState.Preparing:
        return 'bg-blue-100 text-blue-800'
      case OrderState.Ready:
        return 'bg-purple-100 text-purple-800'
      case OrderState.OnTheWay:
        return 'bg-orange-100 text-orange-800'
      case OrderState.Delivered:
        return 'bg-green-100 text-green-800'
      case OrderState.Cancelled:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
