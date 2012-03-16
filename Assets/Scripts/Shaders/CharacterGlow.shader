Shader "Graveck/Character Shader" { 
        Properties { 
        _Color ("Main Color", Color) = (0, 0, 0, 0.004) 
        _Emission ("Emission", Color) = (1, 1, 1, 1) 
                _MainTex ("Base (RGB) Alpha (A)", 2D) = "white" {} 
                _Cutoff ("Base Alpha cutoff", Range (0,.9)) = 0.008490566 
        } 
        SubShader { 
            Tags {Queue=Transparent} 
                // Set up basic lighting 
                Material { 
                        Diffuse [_Color] 
                        Ambient [_Color] 
                  Emission [_Emission]    
                }        
                Lighting On 
                Cull Off 
            ZWrite Off 
             
                Pass {  
                        Colormask rgb 
                        Blend SrcAlpha OneMinusSrcAlpha 
                        SetTexture [_MainTex] { 
                                combine texture * primary, texture 
                        } 
                } 
            Pass {                   
               Colormask a 
               AlphaTest GEqual [_Cutoff] 
               SetTexture [_MainTex] { 
                  combine primary, primary * texture 
               } 
            } 
        } 
} 