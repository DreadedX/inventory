package route

import (
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"

	"inventory/controller"
)

func SetupRoutes() *gin.Engine {
	router := gin.Default()

	// Host react ui
	router.Use(static.Serve("/", static.LocalFile("../ui-dist", false)))
	router.NoRoute(func(c *gin.Context) {
		c.File("../ui-dist/index.html")
	})

	v1 := router.Group("/v1")
	{
		part := v1.Group("part")
		{
			part.GET("list", controller.FetchAllPart)
			part.GET("get/:id", controller.FetchPart)
			part.POST("create", controller.CreatePart)
			part.PUT("update/:id", controller.UpdatePart)
			part.DELETE("delete/:id", controller.DeletePart)
			part.GET("label/:id", controller.CreateLabelPart)
		}

		storage := v1.Group("storage")
		{
			storage.POST("create", controller.CreateStorage)
			storage.GET("get/:id", controller.FetchStorage)
			storage.GET("list", controller.FetchAllStorage)
			storage.PUT("update/:id", controller.UpdateStorage)
			storage.DELETE("delete/:id", controller.DeleteStorage)
		}
	}


	return router
}
