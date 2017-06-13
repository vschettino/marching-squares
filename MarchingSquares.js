/**
 *
 * Implementação do JS:
 * http://devblog.phillipspiess.com/2010/02/23/better-know-an-algorithm-1-marching-squares/
 * Retorna um array com as posições (x e y) com o perímetro do canvas
 *
 */
(function (window){

    var MarchingSquares = {};

    MarchingSquares.NONE = 0;
    MarchingSquares.UP = 1;
    MarchingSquares.LEFT = 2;
    MarchingSquares.DOWN = 3;
    MarchingSquares.RIGHT = 4;


    MarchingSquares.getBlobOutlinePoints = function(sourceCanvas){

        //Pega as medidas para preparar o novo canvas. Add um pequeno offset para
        //melhorar a visualização do contorno em cima da imagem
        MarchingSquares.sourceCanvas = document.createElement("canvas");
        MarchingSquares.sourceCanvas.width = sourceCanvas.width + 2;
        MarchingSquares.sourceCanvas.height = sourceCanvas.height + 1;
        MarchingSquares.sourceContext = MarchingSquares.sourceCanvas.getContext("2d");
        MarchingSquares.sourceContext.drawImage(sourceCanvas,1,1);

        // Ponto inicial é o primeiro pixel não transparente de cima para baixo
        var startingPoint = MarchingSquares.getFirstNonTransparentPixelTopDown(MarchingSquares.sourceCanvas);

        // Percorre o perímetro e retorna os pontos
        return MarchingSquares.walkPerimeter(startingPoint.x, startingPoint.y);
    };

    MarchingSquares.getFirstNonTransparentPixelTopDown = function(canvas){
        var context = canvas.getContext("2d");
        var y, i, rowData;
        for(y = 0; y < canvas.height; y++){
            rowData = context.getImageData(0, y, canvas.width, 1).data;
            for(i=0; i<rowData.length; i+=4){
                if(rowData[i+3] > 0){
                    return {x : i/4, y : y};
                }
            }
        }
        return null;
    };

    MarchingSquares.walkPerimeter = function(startX, startY){
        //evitando sair da imagem (através da verificação de limites negativos ou maiores que a imagem original). Não deveria acontecer nunca
        if (startX < 0){
            startX = 0;
        }
        if (startX > MarchingSquares.sourceCanvas.width){
            startX = MarchingSquares.sourceCanvas.width;
        }
        if (startY < 0){
            startY = 0;
        }
        if (startY > MarchingSquares.sourceCanvas.height){
            startY = MarchingSquares.sourceCanvas.height;
        }

        // lista de pontos
        var pointList =[];

        //pontos atuais (começam com os start points)
        var x = startX;
        var y = startY;

        var imageData = MarchingSquares.sourceContext.getImageData(0,0, MarchingSquares.sourceCanvas.width, MarchingSquares.sourceCanvas.height);
        var index, width4 = imageData.width * 4;

        //até retornar ao ponto inicial (por isso do/while e não while/do)
        do{
            //definindo o próximo passo
            index = (y-1) * width4 + (x-1) * 4;
            MarchingSquares.step(index, imageData.data, width4);
            pointList.push(x - 2, y - 1);//offset para melhor visualização

            //ajustando o próximo ponto
            switch (MarchingSquares.nextStep){
                case MarchingSquares.UP:    y--; break;
                case MarchingSquares.LEFT:  x--; break;
                case MarchingSquares.DOWN:  y++; break;
                case MarchingSquares.RIGHT: x++; break;
                default:
                    break;
            }

        } while (x != startX || y != startY);


        return pointList;
    };

    //determinar (e setar) o passo anterior, atual e próximo.
    MarchingSquares.step = function(index, data, width4){

        MarchingSquares.upLeft = data[index + 3] > 0;
        MarchingSquares.upRight = data[index + 7] > 0;
        MarchingSquares.downLeft = data[index + width4 + 3] > 0;
        MarchingSquares.downRight = data[index + width4 + 7] > 0;

        MarchingSquares.previousStep = MarchingSquares.nextStep;

        // Determinando o estado atual. Assim o estado é representado
        // por um conjunto de 4 números binários (de 0000 até 1111) que indicam
        // as direções que devem ser tomadas. por exemplo 3 significa 0011, ou seja,
        // devemos subir e ir para a direita. 1100 (12) significaria que devemos
        // ir para baixo e para a esquerda
        MarchingSquares.state = 0;

        if (MarchingSquares.upLeft){
            MarchingSquares.state |= 1;
        }
        if (MarchingSquares.upRight){
            MarchingSquares.state |= 2;
        }
        if (MarchingSquares.downLeft){
            MarchingSquares.state |= 4;
        }
        if (MarchingSquares.downRight){
            MarchingSquares.state |= 8;
        }

        switch (MarchingSquares.state ){
            case 1: MarchingSquares.nextStep = MarchingSquares.UP; break;
            case 2: MarchingSquares.nextStep = MarchingSquares.RIGHT; break;
            case 3: MarchingSquares.nextStep = MarchingSquares.RIGHT; break;
            case 4: MarchingSquares.nextStep = MarchingSquares.LEFT; break;
            case 5: MarchingSquares.nextStep = MarchingSquares.UP; break;
            case 6:
                if (MarchingSquares.previousStep == MarchingSquares.UP){
                    MarchingSquares.nextStep = MarchingSquares.LEFT;
                }else{
                    MarchingSquares.nextStep = MarchingSquares.RIGHT;
                }
                break;
            case 7: MarchingSquares.nextStep = MarchingSquares.RIGHT; break;
            case 8: MarchingSquares.nextStep = MarchingSquares.DOWN; break;
            case 9:
                if (MarchingSquares.previousStep == MarchingSquares.RIGHT){
                    MarchingSquares.nextStep = MarchingSquares.UP;
                }else{
                    MarchingSquares.nextStep = MarchingSquares.DOWN;
                }
                break;
            case 10: MarchingSquares.nextStep = MarchingSquares.DOWN; break;
            case 11: MarchingSquares.nextStep = MarchingSquares.DOWN; break;
            case 12: MarchingSquares.nextStep = MarchingSquares.LEFT; break;
            case 13: MarchingSquares.nextStep = MarchingSquares.UP; break;
            case 14: MarchingSquares.nextStep = MarchingSquares.LEFT; break;
            default:
                MarchingSquares.nextStep = MarchingSquares.NONE;//algum erro aconteceu
                break;
        }
    };

    window.MarchingSquares = MarchingSquares;

}(window));
